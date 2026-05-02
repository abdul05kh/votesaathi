'use client';

import { useState, useEffect } from 'react';
import { Eye, Type, Volume2, Settings2, Ear } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AccessibilityToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'standard' | 'high-contrast' | 'picto' | 'neuro'>('standard');

  const { speechVoiceCode } = useLanguage();

  useEffect(() => {
    // Remove all classes first
    document.body.classList.remove('high-contrast', 'picto', 'neuro');
    
    // Add specific class
    if (mode !== 'standard') {
      document.body.classList.add(mode);
    }
  }, [mode]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (mode === 'neuro') {
        const target = e.target as HTMLElement;
        // Don't read if they are clicking the accessibility toggle itself
        if (target.closest('.accessibility-menu')) return;
        
        const textToRead = target.innerText || target.getAttribute('aria-label') || target.getAttribute('alt');
        if (textToRead) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToRead);
          utterance.lang = speechVoiceCode || 'en-IN';
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    if (mode === 'neuro') {
      document.addEventListener('click', handleGlobalClick, true);
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      window.speechSynthesis.cancel();
    };
  }, [mode, speechVoiceCode]);

  return (
    <div className="fixed bottom-4 right-4 z-50 accessibility-menu">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col gap-2 w-48 mb-2 animate-fade-in">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Accessibility Modes
          </div>
          
          <button 
            onClick={() => setMode('standard')}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${mode === 'standard' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Type size={18} />
            <span className="text-sm font-medium">Standard</span>
          </button>
          
          <button 
            onClick={() => setMode('high-contrast')}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${mode === 'high-contrast' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Eye size={18} />
            <span className="text-sm font-medium">High Contrast</span>
          </button>

          <button 
            onClick={() => setMode('picto')}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${mode === 'picto' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <span className="text-lg leading-none">🖼️</span>
            <span className="text-sm font-medium">PictoPolitics</span>
          </button>

          <button 
            onClick={() => setMode('neuro')}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${mode === 'neuro' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Volume2 size={18} />
            <span className="text-sm font-medium">NeuroSaathi</span>
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
        aria-label="Accessibility Settings"
      >
        <Settings2 size={24} />
      </button>
    </div>
  );
}
