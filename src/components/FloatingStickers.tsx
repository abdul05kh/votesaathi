'use client';

import { motion } from 'framer-motion';
import { Fingerprint, CheckCircle, Search, Mail, FileText, BadgeAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

const icons = [Fingerprint, CheckCircle, Search, Mail, FileText, BadgeAlert];

// Generate deterministic random values based on index to avoid hydration mismatch
const getStickerData = (i: number) => ({
  x: `${(i * 37) % 100}vw`,
  y: `${(i * 41) % 100}vh`,
  scale: 0.5 + ((i * 13) % 10) / 10,
  duration: 15 + (i % 10) * 2,
  Icon: icons[i % icons.length],
  color: i % 3 === 0 ? 'text-primary' : i % 3 === 1 ? 'text-secondary' : 'text-accent',
});

export default function FloatingStickers() {
  const [mounted, setMounted] = useState(false);
  const stickers = Array.from({ length: 15 }).map((_, i) => getStickerData(i));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {stickers.map((sticker, i) => (
        <motion.div
          key={i}
          initial={{
            x: sticker.x,
            y: sticker.y,
            scale: sticker.scale,
            rotate: 0,
          }}
          animate={{
            y: [`${parseFloat(sticker.y)}vh`, `${parseFloat(sticker.y) - 20}vh`, `${parseFloat(sticker.y)}vh`],
            x: [`${parseFloat(sticker.x)}vw`, `${parseFloat(sticker.x) + 10}vw`, `${parseFloat(sticker.x)}vw`],
            rotate: [0, 90, 180, 360],
          }}
          transition={{
            duration: sticker.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute ${sticker.color} drop-shadow-[0_0_10px_currentColor]`}
        >
          <sticker.Icon size={48} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}
