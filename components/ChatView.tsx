import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Icon from './Icon';
import ChartRenderer from './ChartRenderer';

interface ChatViewProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ history, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    const content = message.parts[0].text;
    try {
      // Check for JSON chart data
      let sanitizedJson = content;
      if (content.startsWith('```json')) {
        sanitizedJson = content.substring(7, content.length - 3).trim();
      }
      const parsed = JSON.parse(sanitizedJson);
      if (parsed.type === 'chart') {
        return <ChartRenderer chartData={parsed} />;
      }
    } catch (e) {
      // Not a JSON chart, render as text
    }
    return <p className="whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="bg-background border border-border rounded-xl p-4 flex flex-col h-[60vh]">
      <h3 className="text-lg font-semibold text-primary mb-4">Converse com o Analista de IA</h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {history.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="brain" className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface text-text-primary'}`}>
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="brain" className="w-5 h-5 text-white" />
              </div>
            <div className="max-w-xl p-3 rounded-xl bg-surface text-text-primary">
                <div className="flex items-center gap-2 text-text-secondary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Faça uma pergunta sobre a análise..."
          className="flex-1 bg-surface border border-border text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-primary text-white p-3 rounded-lg hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-wait"
          aria-label="Send message"
        >
          <Icon name="send" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatView;
