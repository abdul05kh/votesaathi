'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoiceoverContext } from '@/context/VoiceoverContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VoiceoverToggle() {
  const { voiceoverEnabled, setVoiceoverEnabled, isMatrixActive } = useVoiceoverContext();
  const { speechVoiceCode } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);

  const toggle = () => {
    if (isMatrixActive) return;
    const next = !voiceoverEnabled;
    setVoiceoverEnabled(next);
    setShowTooltip(true);
  };

  // Auto-hide tooltip after 3 seconds
  useEffect(() => {
    if (!showTooltip) return;
    const t = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(t);
  }, [showTooltip]);

  if (isMatrixActive) {
    return null; // Hide the toggle when in the matrix as requested
  }

  return (
    <div className="relative">
      {/* Tooltip popup */}
      {showTooltip && (
        <div
          className="absolute top-full right-0 mt-3 w-60 text-white text-sm px-4 py-3 rounded-2xl shadow-2xl pointer-events-none animate-fade-in"
          style={{
            background: 'rgba(11,17,32,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 1000,
          }}
        >
          <div className="flex items-center gap-2 font-semibold mb-1">
            {voiceoverEnabled ? (
              <><Volume2 size={14} style={{ color: '#00d4aa' }} /> Voiceover ON</>
            ) : (
              <><VolumeX size={14} style={{ color: '#f97316' }} /> Voiceover OFF</>
            )}
          </div>
          <p className="text-xs leading-snug" style={{ color: 'rgba(138,155,184,0.85)' }}>
            {voiceoverEnabled
              ? `Speaking in ${speechVoiceCode}. Narration enabled.`
              : 'Click to enable narration on the global page.'}
          </p>
          {/* Caret */}
          <div className="absolute -top-2 right-5 w-3.5 h-3.5 rotate-45"
            style={{ background: 'rgba(11,17,32,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', borderRight: 'none' }} />
        </div>
      )}

      <button
        onClick={toggle}
        disabled={isMatrixActive}
        aria-label={voiceoverEnabled ? 'Disable voiceover' : 'Enable voiceover'}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all border ${
          voiceoverEnabled
            ? 'text-[#00d4aa] border-[rgba(0,212,170,0.3)] bg-[rgba(0,212,170,0.08)] hover:bg-[rgba(0,212,170,0.14)]'
            : 'text-[rgba(138,155,184,0.8)] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.16)]'
        } ${isMatrixActive ? 'opacity-0 pointer-events-none' : ''}`}
      >
        {voiceoverEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        <span className="hidden sm:inline">{voiceoverEnabled ? 'Voice On' : 'Voice Off'}</span>
      </button>
    </div>
  );
}
