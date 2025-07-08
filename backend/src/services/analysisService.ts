import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import * as insightRepository from '../repositories/insightRepository';
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable not set.');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisPromptInPortuguese = `
Você é um analista de dados especialista. Sua tarefa é analisar a captura de tela fornecida de um painel de business intelligence. Com base nos gráficos e tabelas visíveis na imagem, forneça uma análise concisa e abrangente.

Estruture sua resposta estritamente como um objeto JSON em português com as seguintes chaves: "summary", "key_insights" e "recommendations".

- "summary": Uma visão geral breve, de uma frase, do que o painel representa.
- "key_insights": Uma lista (array JSON) de 3 a 5 frases, cada uma como um item separado no array, identificando tendências, padrões ou dados importantes. Mencione quaisquer anomalias ou outliers potenciais.
- "recommendations": Uma lista (array JSON) de 2 a 3 frases, cada uma como um item separado no array, com sugestões práticas ou áreas para investigação.

Não inclua nenhum texto, explicação ou formatação de markdown (como \`\`\`json) fora do objeto JSON principal. A resposta deve ser apenas o JSON.
`;

function ensureArray(value: any): string[] {
  if (Array.isArray(value)) return value;

  // Caso venha como JSON string (com ou sem escape)
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Ignora erro de parse
  }

  // Se ainda não for array, tentar quebrar por vírgula
  if (typeof value === 'string') {
    return value
      .split(/\s*,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/) // Split por vírgula fora de aspas
      .map((item) => item.trim().replace(/^"|"$/g, '')) // Remove aspas externas se existirem
      .filter((item) => item.length > 0);
  }

  return [];
}

export const analyzeAndSave = async (visualizationId: string, base64Image: string) => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: base64Image,
      },
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: { parts: [{ text: analysisPromptInPortuguese }, imagePart] },
      config: {
        responseMimeType: 'application/json',
      },
    });

    let jsonStr = response.text.trim();

    // Remove possíveis markdown fences (```json ... ```)
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const analysisResult: AnalysisResult = JSON.parse(jsonStr);

    // Garante que key_insights e recommendations sejam arrays
    analysisResult.key_insights = ensureArray(analysisResult.key_insights);
    analysisResult.recommendations = ensureArray(analysisResult.recommendations);

    // Salva o resultado no banco
    await insightRepository.create(visualizationId, analysisResult);

    return analysisResult;
  } catch (error) {
    console.error('Error in Gemini API call or processing:', error);
    throw new Error('Failed to get analysis from AI service.');
  }
};