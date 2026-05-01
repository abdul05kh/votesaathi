'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Globe, Sparkles } from 'lucide-react';
import { generateResponse } from '@/lib/gemini';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! I am VoteSaathi. I can help you understand the election process, find your polling booth, or learn how to use an EVM. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In a real app, you would pass the full conversation history. 
      // For MVP, we pass the latest prompt.
      const response = await generateResponse(userMessage.content, language);
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "I'm sorry, I couldn't understand that." };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">Saathi Bot</h2>
            <p className="text-xs text-slate-500 font-medium">Your AI Election Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
            <Globe size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700'
            }`}>
              <p className="text-[15px] leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <button className="mt-2 text-slate-400 hover:text-primary transition-colors">
                  <Volume2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <button 
            type="button"
            className="absolute left-3 p-2 text-slate-400 hover:text-primary transition-colors"
          >
            <Mic size={22} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or use the microphone..."
            className="w-full bg-slate-100 dark:bg-slate-900 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-3.5 pl-12 pr-14 text-[15px] transition-all dark:text-white"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-sm"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
