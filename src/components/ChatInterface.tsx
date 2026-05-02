'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Globe, Sparkles, MicOff } from 'lucide-react';
import { generateResponse } from '@/lib/gemini';
import { useLanguage } from '@/context/LanguageContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Global typing for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatInterface() {
  const { language, t, speechVoiceCode } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! I am VoteSaathi. I can help you understand the election process, find your polling booth, or learn how to use an EVM. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          // Auto submit when speech ends
          handleSpeechSubmit(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    // Initial welcome TTS
    speak(messages[0].content);
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = (text: string) => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechVoiceCode || 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          // Tell recognition to listen for the selected language/dialect
          recognitionRef.current.lang = speechVoiceCode || 'hi-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      }
    }
  };

  const handleSpeechSubmit = async (spokenText: string) => {
    if (!spokenText.trim() || isLoading) return;
    await processMessage(spokenText);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    await processMessage(input);
  };

  const processMessage = async (messageText: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(userMessage.content, language);
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "I'm sorry, I couldn't understand that." };
      setMessages(prev => [...prev, assistantMessage]);
      speak(assistantMessage.content);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
      speak(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 relative">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">Saathi Bot</h2>
            <p className="text-xs text-slate-500 font-medium">SanshayNivaran & BhashaSetu Engine</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 z-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700'
            }`}>
              <p className="text-[15px] leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <button onClick={() => speak(msg.content)} className="mt-2 text-slate-400 hover:text-primary transition-colors" title="Listen">
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
      <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-10">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <button 
            type="button"
            onClick={toggleListening}
            className={`absolute left-3 p-2 rounded-full transition-colors ${isListening ? 'text-white bg-red-500 animate-pulse' : 'text-slate-400 hover:text-primary'}`}
            title="BhashaSetu Voice Input"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={22} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening in your dialect..." : "Type your question or use the microphone..."}
            className="w-full bg-slate-100 dark:bg-slate-900 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-3.5 pl-12 pr-14 text-[15px] transition-all dark:text-white"
            disabled={isLoading || isListening}
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
