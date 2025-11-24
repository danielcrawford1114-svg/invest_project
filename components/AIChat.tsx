import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole, Stock } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface AIChatProps {
  currentStock: Stock;
}

const SUGGESTED_QUESTIONS = [
  "Is this a good buy right now?",
  "Latest news for this stock?",
  "Competitor analysis",
  "What should I invest in?"
];

const AIChat: React.FC<AIChatProps> = ({ currentStock }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: MessageRole.MODEL,
      text: "Hello! I'm MarketMind. I can analyze market trends, check real-time news, and help you evaluate investment opportunities. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass simple context string about current stock
      const context = `
      Stock: ${currentStock.symbol} (${currentStock.name})
      Current Price: $${currentStock.price}
      Today's Change: ${currentStock.change.toFixed(2)} (${currentStock.changePercent.toFixed(2)}%)
      Volume: ${currentStock.data[currentStock.data.length - 1].volume}
      `;
      
      const response = await sendChatMessage(textToSend, messages, context);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: response.text,
        timestamp: new Date(),
        groundingChunks: response.groundingChunks
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: "I'm having trouble connecting to the market data server right now. Please check your connection or API key.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-full md:w-96">
      <div className="p-4 border-b border-slate-800 bg-slate-900 z-10 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <h2 className="text-lg font-semibold text-white tracking-wide">Investment Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === MessageRole.USER;
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                } ${msg.isError ? 'bg-red-900/50 border-red-800' : ''}`}
              >
                <div className="markdown prose prose-invert prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Sources</p>
                    <ul className="space-y-1.5">
                      {msg.groundingChunks.map((chunk, idx) => (
                         chunk.web && (
                          <li key={idx}>
                            <a 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-start gap-1.5"
                            >
                              <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                              <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                            </a>
                          </li>
                         )
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-800 rounded-2xl rounded-bl-sm p-4 border border-slate-700 flex gap-1 items-center shadow-lg">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
        {/* Quick Suggestion Chips */}
        {messages.length < 3 && !isLoading && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 text-slate-300 text-xs rounded-full transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onFormSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask MarketMind..."
            className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700 transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-slate-500 text-center">
          MarketMind AI can make mistakes. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
};

export default AIChat;