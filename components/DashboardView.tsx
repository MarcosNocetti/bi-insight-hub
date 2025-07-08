import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Visualization, AnalysisResult, Insight, ChatMessage } from '../types';
import Icon from './Icon';
import { analyzeDashboard, getInsightsForVisualization } from '../services/geminiService';
import InsightsHistory from './InsightsHistory';
import ChatView from './ChatView';
import { GoogleGenAI, Chat } from '@google/genai';

interface DashboardViewProps {
  visualization: Visualization | null;
}

// Componente auxiliar para o card de resultado da análise
const AnalysisCard: React.FC<{ result: AnalysisResult }> = ({ result }) => (
    <div className="mt-6 bg-background border border-border rounded-xl p-6 space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Resumo</h3>
            <p className="text-text-secondary">{result.summary}</p>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Insights Chave</h3>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {result.key_insights.map((insight, index) => <li key={index}>{insight}</li>)}
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Recomendações</h3>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {result.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
            </ul>
        </div>
    </div>
);

// Componente principal da visualização do dashboard
const DashboardView: React.FC<DashboardViewProps> = ({ visualization }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [pastInsights, setPastInsights] = useState<Insight[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const initializeChat = useCallback(async (analysisResult: AnalysisResult) => {
    try {
      if (!process.env.API_KEY) {
          setError("A chave de API para o chat não está configurada.");
          return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are a professional and helpful data analyst. The user has just received an AI-generated analysis of a business intelligence dashboard. The analysis is as follows: ${JSON.stringify(analysisResult)}. Your main goal is to answer the user's questions about this analysis and the underlying data it might represent. When asked to create a chart or visualization, you MUST respond ONLY with a single, valid JSON object. The JSON must have this exact structure: {"type": "chart", "chartType": "bar" | "line" | "pie", "data": [...], "title": "Chart Title"}. For all chart types, the "data" array must contain objects with "name" (string for the label) and "value" (number for the data point) keys. Do not include any text, explanations, or markdown fences like \`\`\`json around the JSON object. For all other questions, provide a clear, text-based answer in Portuguese.`;
      
      const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash-preview-04-17',
          // The config is same as models.generateContent config.
          config: {
            systemInstruction
          }
      });

      setChat(chatSession);
      setChatHistory([{
          role: 'model',
          parts: [{ text: `Análise concluída. Analisei os insights. Que perguntas você tem sobre os dados?` }]
      }]);

    } catch(e) {
      console.error("Failed to initialize chat", e);
      setError("Não foi possível iniciar o chat com a IA.");
    }
  }, []);

  useEffect(() => {
    setAnalysis(null);
    setError(null);
    setChat(null);
    setChatHistory([]);
    if (visualization) {
      setIsLoading(true);
      getInsightsForVisualization(visualization.id)
        .then(setPastInsights)
        .catch(() => setError("Falha ao carregar o histórico de análises."))
        .finally(() => setIsLoading(false));
    } else {
        setPastInsights([]);
    }
  }, [visualization]);

  const handleSendChatMessage = async (message: string) => {
    if (!chat) return;

    setIsChatLoading(true);
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, userMessage]);

    try {
        const response = await chat.sendMessage({message});
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
        setChatHistory(prev => [...prev, modelMessage]);
    } catch (e) {
        console.error("Chat error:", e);
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Desculpe, encontrei um erro. Por favor, tente novamente." }] };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  };


  const handleAnalyze = useCallback(async () => {
    if (!visualization) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setChat(null);
    setChatHistory([]);

    let stream: MediaStream | null = null;
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "never" } as any,
            audio: false,
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        await new Promise<void>((resolve, reject) => {
            video.onloadeddata = () => resolve();
            video.onerror = (e) => reject(e);
            setTimeout(() => reject(new Error('Video stream timed out.')), 5000);
        });

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to get canvas context.');
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Image = dataUrl.split(',')[1];
        if (!base64Image) throw new Error('Failed to convert canvas to base64.');
        
        stream.getTracks().forEach(track => track.stop());

        const result = await analyzeDashboard(visualization.id, base64Image);
        if (result) {
            setAnalysis(result);
            // Adicionar a nova análise ao topo do histórico
            setPastInsights(prev => [{...result, id: 'new', visualization_id: visualization.id, created_at: new Date().toISOString()}, ...prev]);
            initializeChat(result);
        } else {
            setError('Falha ao obter análise. A resposta estava vazia ou inválida.');
        }
    } catch (e: any) {
        if (stream) stream.getTracks().forEach(track => track.stop());
        
        let errorMessage = 'Ocorreu um erro inesperado durante a captura de tela.';
        if (e.name === 'NotAllowedError') {
             errorMessage = 'A permissão para capturar a tela foi negada. Por favor, permita o compartilhamento para usar este recurso.';
        } else if (e.message) {
             errorMessage = `Falha na Captura: ${e.message}`;
        }
        setError(errorMessage);
        console.error("Screen capture or analysis error:", e);
    } finally {
        setIsLoading(false);
    }
  }, [visualization, initializeChat]);

  if (!visualization) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Icon name="chart" className="w-24 h-24 text-gray-600 mb-4" />
        <h2 className="text-3xl font-bold text-text-primary">Bem-vindo ao Insight Hub</h2>
        <p className="text-text-secondary mt-2 max-w-md">Selecione um dashboard na barra lateral para visualizá-lo ou adicione um novo para começar.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-text-primary mb-4">{visualization.name}</h2>
        <div className="aspect-video w-full bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
          <iframe ref={iframeRef} key={visualization.id} src={visualization.url} className="w-full h-full border-0" title={visualization.name} sandbox="allow-scripts allow-same-origin allow-forms" />
        </div>

        <div className="mt-8 space-y-8">
            <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                           <Icon name="brain" className="w-6 h-6 text-primary"/> Análise com IA
                        </h3>
                        <p className="text-text-secondary mt-1">Gere insights capturando a visualização atual do seu dashboard.</p>
                        <p className="text-xs text-gray-500 mt-2">Você será solicitado a compartilhar sua tela ou janela do aplicativo.</p>
                    </div>
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-hover transition-all disabled:bg-gray-500 disabled:cursor-wait">
                        {isLoading ? <Icon name="loading" className="w-5 h-5 animate-spin" /> : <Icon name="brain" className="w-5 h-5" />}
                        <span>{isLoading ? 'Analisando...' : 'Gerar Insights'}</span>
                    </button>
                </div>

                {isLoading && <div className="mt-6 text-center text-text-secondary animate-pulse-fast"><p>Capturando tela e analisando dados... por favor, aguarde.</p></div>}
                {error && (
                    <div className="mt-6 flex items-center gap-3 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                        <Icon name="warning" className="w-6 h-6 flex-shrink-0"/>
                        <div><h4 className="font-bold">Falha na Análise</h4><p className="text-sm">{error}</p></div>
                    </div>
                )}
                {analysis && (
                  <>
                    <AnalysisCard result={analysis} />
                    {chat && (
                      <div className="mt-6">
                        <ChatView
                          history={chatHistory}
                          onSendMessage={handleSendChatMessage}
                          isLoading={isChatLoading}
                        />
                      </div>
                    )}
                  </>
                )}
            </div>

            <InsightsHistory pastInsights={pastInsights} /> 
        </div>
      </div>
    </main>
  );
};

export default DashboardView;