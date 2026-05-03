'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Type, Volume2, Settings2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useVoiceoverContext } from '@/context/VoiceoverContext';
import VoiceoverToggle from './VoiceoverToggle';


export default function AccessibilityToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'standard' | 'high-contrast' | 'picto' | 'neuro'>('standard');

  const { speechVoiceCode } = useLanguage();
  const { voiceoverEnabled, setVoiceoverEnabled } = useVoiceoverContext();

  useEffect(() => {
    // Remove all classes first to ensure a clean state
    document.body.classList.remove('high-contrast', 'picto', 'neuro');
    
    // Add specific accessibility class if not in standard mode
    if (mode !== 'standard') {
      document.body.classList.add(mode);
    }
  }, [mode]);

  /**
   * NeuroFocus: Global click listener that reads out text from the clicked element.
   * Helps users with neurodivergent needs or visual impairments.
   */
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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 bg-[#0b1120]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-3 flex flex-col gap-2 w-56 mb-2"
          >
            <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Interface Experience
            </div>
            
            <button 
              onClick={() => setMode('standard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${mode === 'standard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}
              aria-label="Switch to standard visual mode"
              aria-pressed={mode === 'standard'}
            >
              <Type size={18} />
              <span className="text-sm font-bold">Standard</span>
            </button>
            
            <button 
              onClick={() => setMode('high-contrast')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${mode === 'high-contrast' ? 'bg-[#ffff00] text-black shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:bg-white/5'}`}
              aria-label="Switch to high contrast mode"
              aria-pressed={mode === 'high-contrast'}
            >
              <Eye size={18} />
              <span className="text-sm font-bold">Contrast+</span>
            </button>
+
            <button 
              onClick={() => setMode('picto')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${mode === 'picto' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-slate-400 hover:bg-white/5'}`}
              aria-label="Switch to PictoVishwa icon-assisted mode"
              aria-pressed={mode === 'picto'}
            >
              <span className="text-lg leading-none">🖼️</span>
              <span className="text-sm font-bold">PictoVishwa</span>
            </button>

            <button 
              onClick={() => setMode('neuro')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${mode === 'neuro' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
              aria-label="Switch to NeuroFocus reading-assistance mode"
              aria-pressed={mode === 'neuro'}
            >
              <Volume2 size={18} />
              <span className="text-sm font-bold">NeuroFocus</span>
            </button>

            <div className="h-px bg-white/10 my-1 mx-2" />

            <div className="px-2 py-1">
              <VoiceoverToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
