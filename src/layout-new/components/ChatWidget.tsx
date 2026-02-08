import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { generateSupportResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! Need help with ZAVZ Injector v2.1.0?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await generateSupportResponse(userMsg.text, "ZAVZ Injector v2.1.0, Red Theme, Updates");

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[var(--accent-600)] rounded-full flex items-center justify-center shadow-xl shadow-[var(--accent-shadow)] hover:bg-[var(--accent-500)] transition-all z-50 group hover:-translate-y-1"
      >
        <MessageSquare className="text-white w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-[#18181b] border border-[var(--accent-500-30)] rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-[#202024] p-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
            <Bot size={16} className="text-[var(--accent-500)]" />
            <span className="text-sm font-bold text-white">ZAVZ AI Agent</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 h-64 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-[#121214]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 rounded-lg text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[var(--accent-600)] text-white rounded-br-none shadow-md' 
                : 'bg-[#27272a] text-gray-200 rounded-bl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-[#27272a] p-2 rounded-lg rounded-bl-none">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-500)] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--accent-500)] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--accent-500)] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 bg-[#202024] border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask ZAVZ AI..."
          className="flex-1 bg-[#121214] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent-500)]"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="p-1.5 bg-[var(--accent-600)] rounded hover:bg-[var(--accent-500)] disabled:opacity-50 text-white shadow-lg"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};