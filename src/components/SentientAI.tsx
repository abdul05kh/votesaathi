'use client';

import AudioVisualizer from './AudioVisualizer';
import { Mic, MicOff, BrainCircuit } from 'lucide-react';

interface SentientAIProps {
  isListening: boolean;
  isAiThinking: boolean;
  isSpeakingState: boolean;
  onAskAI: () => void;
}

export default function SentientAI({ 
  isListening, 
  isAiThinking, 
  isSpeakingState, 
  onAskAI 
}: SentientAIProps) {
  return (
    <>
      <AudioVisualizer isSpeaking={isSpeakingState} />
      
      {/* AI Talk Button */}
      <button
        onClick={onAskAI}
        aria-label={isListening ? "Stop listening" : "Ask Matrix Intelligence"}
        className={`absolute bottom-8 right-8 z-[120] p-5 rounded-full backdrop-blur-md transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
          isListening 
            ? 'bg-cyan-500 text-white shadow-[0_0_50px_#22d3ee] scale-110' 
            : isAiThinking
            ? 'bg-purple-600 text-white shadow-[0_0_50px_#9333ea] animate-pulse'
            : 'bg-white/10 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
        }`}
      >
        {isListening ? (
          <Mic size={28} className="animate-pulse" />
        ) : isAiThinking ? (
          <BrainCircuit size={28} className="animate-spin" />
        ) : (
          <MicOff size={28} />
        )}
      </button>
    </>
  );
}
