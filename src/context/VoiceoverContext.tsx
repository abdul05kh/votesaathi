'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface VoiceoverContextType {
  voiceoverEnabled: boolean;
  setVoiceoverEnabled: (enabled: boolean) => void;
  speakIfEnabled: (text: string, lang: string, onEnd?: () => void) => void;
  stopVoiceover: () => void;
  isMatrixActive: boolean;
  setIsMatrixActive: (active: boolean) => void;
}

const VoiceoverContext = createContext<VoiceoverContextType | undefined>(undefined);

export function VoiceoverProvider({ children }: { children: React.ReactNode }) {
  const [voiceoverEnabled, setVoiceoverEnabledState] = useState(false);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stopVoiceover = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  }, []);

  const setVoiceoverEnabled = useCallback((enabled: boolean) => {
    setVoiceoverEnabledState(enabled);
    if (!enabled) {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    }
  }, []);

  const speakIfEnabled = useCallback((text: string, lang: string, onEnd?: () => void) => {
    if (!voiceoverEnabled || isMatrixActive) {
      onEnd?.();
      return;
    }
    if (typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) { onEnd?.(); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0];
    let voice = voices.find(v =>
      v.lang.startsWith(langPrefix) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'))
    );
    if (!voice) voice = voices.find(v => v.lang.startsWith(langPrefix));
    if (voice) utterance.voice = voice;

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  }, [voiceoverEnabled, isMatrixActive]);

  return (
    <VoiceoverContext.Provider value={{ 
      voiceoverEnabled, 
      setVoiceoverEnabled, 
      speakIfEnabled, 
      stopVoiceover,
      isMatrixActive,
      setIsMatrixActive
    }}>
      {children}
    </VoiceoverContext.Provider>
  );
}

export function useVoiceoverContext() {
  const ctx = useContext(VoiceoverContext);
  if (!ctx) throw new Error('useVoiceoverContext must be used within VoiceoverProvider');
  return ctx;
}
