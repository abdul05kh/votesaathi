'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Scale, Send, Mic, Square, Loader2, Volume2, Search, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ElectionLawyer() {
  const { language, speechVoiceCode } = useLanguage();
  const { isListening, startListening, stopListening } = useSpeechRecognition('en-IN');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to SanshayNivaran. I am your Election Lawyer AI, grounded in the Representation of the People Act, 1951. How may I clarify your voting rights or electoral laws today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const replayAudio = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*]/g, ''));
    utterance.lang = speechVoiceCode || 'en-IN';
    window.speechSynthesis.speak(utterance);
  }, [speechVoiceCode]);

  const processMessage = useCallback(async (messageText: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setAnnouncement('Consulting legal database...');

    try {
      const { consultLawyer } = await import('@/lib/gemini');
      const reply = await consultLawyer(messageText, language);
      
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMessage]);
      setAnnouncement('Legal advice received.');
      
      if (reply) {
        replayAudio(reply);
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'An error occurred while consulting the legal database.' }]);
      setAnnouncement('Error occurred during consultation.');
    } finally {
      setIsLoading(false);
    }
  }, [language, replayAudio]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening) stopListening();

    const textToSubmit = input;
    setInput('');
    await processMessage(textToSubmit);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      setAnnouncement('Voice input stopped.');
    } else {
      setInput('');
      setAnnouncement('Listening for voice input...');
      startListening((text) => {
        setInput(text);
      });
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass-dark rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative" role="region" aria-label="Election Lawyer AI Chat">
      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      {/* Header */}
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/30">
            <Scale size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">SanshayNivaran</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 uppercase tracking-tighter font-semibold">
              <Search size={12} aria-hidden="true" /> Legal Knowledge Base
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
          <Sparkles size={14} className="text-orange-400" />
          <span className="text-[10px] text-slate-400 font-bold uppercase">Pro Bono AI</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-[#020617]/50" aria-live="polite" aria-atomic="false">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg transition-all duration-300 ${
              m.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none scale-100' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
            }`}>
              {m.role === 'assistant' ? (
                <div className="prose prose-invert max-w-none prose-sm leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                  <button 
                    onClick={() => replayAudio(m.content)}
                    aria-label="Replay legal advice audio"
                    className="mt-3 text-xs flex items-center gap-1 text-slate-400 hover:text-orange-400 transition-colors focus:opacity-100 group-hover:opacity-100 md:opacity-0"
                  >
                    <Volume2 size={14} aria-hidden="true" /> Listen to Advice
                  </button>
                </div>
              ) : (
                <p className="leading-relaxed">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
              <Loader2 className="animate-spin text-orange-500" size={20} aria-hidden="true" />
              <span className="text-slate-400 text-sm font-medium">Analyzing RPA 1951...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-700 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label={isListening ? "Stop voice consultation" : "Start voice consultation"}
            className={`p-4 rounded-xl transition-all shadow-md flex-shrink-0 focus:ring-2 focus:ring-orange-500/50 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700'
            }`}
          >
            {isListening ? <Square size={20} aria-hidden="true" /> : <Mic size={20} aria-hidden="true" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Ask about election laws"
            placeholder={isListening ? "Listening..." : "Ask about your voting rights..."}
            className="flex-1 bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-500 transition-all"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Submit legal query"
            className="p-4 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none flex-shrink-0 active:scale-95"
          >
            <Send size={20} className={input.trim() && !isLoading ? 'opacity-100' : 'opacity-50'} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

