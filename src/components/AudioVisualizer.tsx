'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface AudioVisualizerProps {
  isSpeaking: boolean;
}

export default function AudioVisualizer({ isSpeaking }: AudioVisualizerProps) {
  const { language } = useLanguage();
  
  if (!isSpeaking) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 glass-bright-card px-4 py-2 rounded-full border border-primary/20 shadow-lg">
      <div className="flex items-center gap-1 h-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-primary rounded-full"
            animate={{
              height: ["20%", "100%", "20%"]
            }}
            transition={{
              duration: 0.6 + (i * 0.1),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-800 tracking-wider uppercase">
        {language === 'en' ? 'AI Voice' : 'एआई आवाज़'}
      </span>
    </div>
  );
}
