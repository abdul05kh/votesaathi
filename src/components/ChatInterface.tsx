'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Volume2, Sparkles, MicOff, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { trackEvent, saveChatSession, saveFeedback } from '@/lib/firebase';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatInterface() {
  const { language, speechVoiceCode } = useLanguage();
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [announcement, setAnnouncement] = useState('');

  /**
   * Synthesizes speech from text using the Web Speech API.
   * Ensures previous utterances are cancelled before starting new ones.
   */
  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechVoiceCode || 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }, [speechVoiceCode]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Orchestrates the message lifecycle: user input -> streaming AI response -> cleanup.
   * Handles Firebase logging and text-to-speech triggers.
   */
  const processMessage = useCallback(async (messageText: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAnnouncement('Generating response...');

    trackEvent('chat_question', { language });

    try {
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }]);

      let accumulatedText = '';
      const { generateStreamingResponse } = await import('@/lib/gemini');
      const stream = generateStreamingResponse(messageText, language);

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId ? { ...msg, content: accumulatedText } : msg
        ));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === assistantId ? { ...msg, isStreaming: false } : msg
      ));
      setAnnouncement('Response complete.');
      
      speak(accumulatedText);
      const { saveChatSession } = await import('@/lib/firebase');
      saveChatSession(userMessage.content, accumulatedText, language);

    } catch {
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or call ECI 1950.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      speak(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  }, [language, speak]);

  const handleSpeechSubmit = useCallback(async (spokenText: string) => {
    if (!spokenText.trim() || isLoading) return;
    await processMessage(spokenText);
  }, [isLoading, processMessage]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    await processMessage(input);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          handleSpeechSubmit(transcript);
        };

        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
    
    const welcomeMsg = messages.find(m => m.id === 'welcome');
    if (welcomeMsg) speak(welcomeMsg.content);
    
    return () => window.speechSynthesis.cancel();
  }, [handleSpeechSubmit, speak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Toggles the voice input listener. Starts/stops the SpeechRecognition engine.
   */
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = speechVoiceCode || 'hi-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 relative">
      <div className="sr-only" aria-live="polite" data-testid="ai-announcement">
        {announcement}
      </div>
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg animate-pulse-slow">
            <Sparkles size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">Saathi Bot</h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">SanshayNivaran Engine v2.0</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-primary/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm transition-all duration-300 ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-sm translate-x-0' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700'
            }`}>
              <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              
              {msg.role === 'assistant' && !msg.isStreaming && (
                <div className="mt-3 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 pt-2">
                  <button onClick={() => speak(msg.content)} className="text-slate-400 hover:text-primary transition-colors p-1" aria-label="Listen to response" title="Listen">
                    <Volume2 size={16} />
                  </button>
                  <button onClick={() => copyToClipboard(msg.content, msg.id)} className="text-slate-400 hover:text-primary transition-colors p-1" aria-label="Copy response to clipboard" title="Copy response">
                    {copiedId === msg.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <div className="ml-auto flex gap-1">
                    <button 
                      onClick={() => {
                        saveFeedback(`Positive: ${msg.content}`);
                        trackEvent('feedback_positive', { message_id: msg.id });
                      }} 
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-green-500 transition-colors" aria-label="Mark as helpful" title="Helpful"
                    >
                      <ThumbsUp size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        saveFeedback(`Negative: ${msg.content}`);
                        trackEvent('feedback_negative', { message_id: msg.id });
                      }} 
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors" aria-label="Mark as not helpful" title="Not helpful"
                    >
                      <ThumbsDown size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && !messages.some(m => m.isStreaming) && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-10">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex items-center gap-2 relative">
          <button 
            type="button"
            onClick={toggleListening}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            className={`absolute left-3 p-2 rounded-full transition-all duration-300 ${isListening ? 'text-white bg-red-500 scale-110 shadow-lg' : 'text-slate-400 hover:text-primary'}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={22} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Voter query input"
            placeholder={isListening ? "Listening..." : "Ask VoteSaathi anything..."}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-full py-3.5 pl-12 pr-14 text-[15px] transition-all dark:text-white"
            disabled={isLoading || isListening}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="absolute right-2 p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-30 transition-all shadow-md active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

