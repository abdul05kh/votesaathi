'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useVoiceover } from '@/hooks/useVoiceover';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { consultLawyer } from '@/lib/gemini';
import { Scale, Send, Mic, Square, Loader2, Volume2, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ElectionLawyer() {
  const { language, speechVoiceCode } = useLanguage();
  const { speak, stop } = useVoiceover();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition('en-IN');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to SanshayNivaran. I am your Election Lawyer AI, grounded in the Representation of the People Act, 1951. How may I clarify your voting rights or electoral laws today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript && isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening) stopListening();

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await consultLawyer(userMessage, language);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "" }]);
      
      // Auto-read the response
      if (response) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(response.replace(/[#*]/g, ''));
        utterance.lang = speechVoiceCode || 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: "An error occurred while consulting the legal database." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      setInput('');
      startListening((text) => {
        setInput(text);
        // We do not auto-submit here to allow the user to review the transcript
      });
    }
  };

  const replayAudio = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*]/g, ''));
    utterance.lang = speechVoiceCode || 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass-dark rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center gap-3 backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/30">
          <Scale size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">SanshayNivaran</h2>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <Search size={12} /> Grounded in RPA 1951 & ECI Guidelines
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-[#020617]/50">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
              m.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
            }`}>
              {m.role === 'assistant' ? (
                <div className="prose prose-invert max-w-none prose-sm leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                  <button 
                    onClick={() => replayAudio(m.content)}
                    className="mt-3 text-xs flex items-center gap-1 text-slate-400 hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Volume2 size={14} /> Listen to Legal Advice
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
              <Loader2 className="animate-spin text-orange-500" size={20} />
              <span className="text-slate-400 text-sm">Consulting Election Laws...</span>
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
            className={`p-4 rounded-xl transition-all shadow-md flex-shrink-0 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700'
            }`}
          >
            {isListening ? <Square size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your voting rights, ECI rules, etc..."
            className="flex-1 bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-500 transition-all"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none flex-shrink-0"
          >
            <Send size={20} className={input.trim() && !isLoading ? 'opacity-100' : 'opacity-50'} />
          </button>
        </form>
      </div>
    </div>
  );
}
