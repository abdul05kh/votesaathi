'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function useVoiceover() {
  const { speechVoiceCode } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    
    // Cleanup on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, onEndCallback?: () => void) => {
    if (!synthRef.current) {
      onEndCallback?.();
      return;
    }
    
    // Stop any current speech
    synthRef.current.cancel();

    if (!text) {
      setIsSpeaking(false);
      onEndCallback?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechVoiceCode;
    utterance.rate = 0.95; // Slightly slower for a smoother feel
    utterance.pitch = 1.1; // Slightly higher pitch
    
    // Try to find a local female voice that matches the language code
    const voices = synthRef.current.getVoices();
    let preferredVoice = voices.find(v => 
      v.lang.startsWith(speechVoiceCode.split('-')[0]) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'))
    );
    
    // Fallback to any voice matching language if female isn't found
    if (!preferredVoice) {
       preferredVoice = voices.find(v => v.lang.startsWith(speechVoiceCode.split('-')[0]));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEndCallback?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEndCallback?.();
    };

    synthRef.current.speak(utterance);
  }, [speechVoiceCode]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
}
