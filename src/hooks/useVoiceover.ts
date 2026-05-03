'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useVoiceoverContext } from '@/context/VoiceoverContext';

export function useVoiceover() {
  const { speechVoiceCode } = useLanguage();
  const { voiceoverEnabled } = useVoiceoverContext();
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && synthRef.current === null) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  /**
   * Detect the currently active language from Google Translate cookie/HTML lang attribute.
   * Falls back to the LanguageContext speechVoiceCode if no translation is active.
   */
  const getActiveLang = useCallback((): string => {
    if (typeof document === 'undefined') return speechVoiceCode;
    // Google Translate sets lang on <html> element
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang !== 'en' && htmlLang.length >= 2) {
      // Build a BCP-47 style code; keep full if already formatted
      return htmlLang.includes('-') ? htmlLang : `${htmlLang}-${htmlLang.toUpperCase()}`;
    }
    // Fallback: check Google Translate cookie
    const gtCookie = document.cookie.split(';').find(c => c.trim().startsWith('googtrans='));
    if (gtCookie) {
      const parts = gtCookie.trim().split('/');
      const lang = parts[parts.length - 1];
      if (lang && lang !== 'en') {
        return lang.includes('-') ? lang : `${lang}-${lang.toUpperCase()}`;
      }
    }
    return speechVoiceCode;
  }, [speechVoiceCode]);

  const speak = useCallback((text: string, onEndCallback?: () => void) => {
    // Only speak if voiceover is enabled
    if (!voiceoverEnabled) {
      onEndCallback?.();
      return;
    }

    const synth = synthRef.current;
    if (!synth) {
      onEndCallback?.();
      return;
    }

    synth.cancel();

    if (!text) {
      onEndCallback?.();
      return;
    }

    const activeLang = getActiveLang();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    const voices = synth.getVoices();
    const langPrefix = activeLang.split('-')[0];
    let preferredVoice = voices.find(v =>
      v.lang.startsWith(langPrefix) &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('samantha'))
    );
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith(langPrefix));
    }
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => onEndCallback?.();
    utterance.onerror = () => onEndCallback?.();

    synth.speak(utterance);
  }, [voiceoverEnabled, getActiveLang]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  return { speak, stop };
}
