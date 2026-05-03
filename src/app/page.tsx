'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import AccessibilityToggle from '@/components/AccessibilityToggle';
import { ShieldCheck, MessageSquare, Box, ArrowDown, Camera, MapPin, Scale, Zap, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy-load heavy components for faster initial page load
const ChatInterface = dynamic(() => import('@/components/ChatInterface'), { ssr: false });
const EVMSimulator = dynamic(() => import('@/components/EVMSimulator'), { ssr: false });
const ArEvm = dynamic(() => import('@/components/ArEvm'), { ssr: false });
const VoteVision = dynamic(() => import('@/components/VoteVision'), { ssr: false });
const PollingPathfinder = dynamic(() => import('@/components/PollingPathfinder'), { ssr: false });
const ElectionLawyer = dynamic(() => import('@/components/ElectionLawyer'), { ssr: false });
const ElectionTimeline = dynamic(() => import('@/components/ElectionTimeline'), { ssr: false });
const FloatingStickers = dynamic(() => import('@/components/FloatingStickers'), { ssr: false });

const TABS = [
  { id: 'chat',       label: 'Saathi AI',     icon: MessageSquare },
  { id: 'evm',        label: 'EVM Simulator',  icon: Box           },
  { id: 'ar',         label: 'AR Hologram',    icon: Camera        },
  { id: 'vision',     label: 'DocVerifier',    icon: ShieldCheck   },
  { id: 'pathfinder', label: 'Booth Finder',   icon: MapPin        },
  { id: 'lawyer',     label: 'Sanshay AI',     icon: Scale         },
] as const;

type TabId = typeof TABS[number]['id'];

const STATS = [
  { value: '968M+', label: 'Registered Voters', icon: Users },
  { value: '12+', label: 'Regional Languages', icon: Award },
  { value: '100%', label: 'AI-Powered', icon: Zap },
];

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('chat');

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full relative overflow-x-hidden">
      <FloatingStickers />
      <AccessibilityToggle />

      {/* ── HERO ── */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full border border-white/[0.03] absolute animate-pulse-ring" style={{ animationDelay: '0s' }} />
          <div className="w-[900px] h-[900px] rounded-full border border-white/[0.025] absolute animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
          <div className="w-[1100px] h-[1100px] rounded-full border border-white/[0.02] absolute animate-pulse-ring" style={{ animationDelay: '1s' }} />
        </div>

        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="badge badge-accent mb-6"
        >
          <Zap size={11} />
          India&apos;s AI-Powered Election Assistant
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-6">
            {t.heroTitle1}
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fb923c 40%, #00d4aa 100%)' }}
            >
              {t.heroTitle2}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--foreground-muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={() => scrollToSection('learn-to-vote')} className="btn-primary">
            {t.startLearning}
            <ArrowDown size={18} />
          </button>
          <button onClick={() => scrollToSection('practice-zone')} className="btn-secondary">
            {t.trySimulator}
          </button>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 flex flex-col sm:flex-row items-center gap-6 sm:gap-12"
        >
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <Icon size={18} style={{ color: '#f97316' }} />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-[var(--foreground)]">{value}</div>
                <div className="text-xs text-[var(--foreground-muted)] font-medium">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ArrowDown size={22} className="text-[var(--foreground-muted)]" />
        </motion.div>
      </section>

      {/* ── ELECTION MATRIX ── */}
      <ElectionTimeline />

      {/* ── PRACTICE ZONE ── */}
      <section id="practice-zone" className="py-24 px-4 relative">
        {/* Section header */}
        <div className="max-w-5xl mx-auto mb-14 text-center">
          <div className="badge badge-primary inline-flex mb-4">Tools & AI</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">{t.practiceTitle}</h2>
          <p className="text-[var(--foreground-muted)] text-lg max-w-xl mx-auto">{t.practiceSubtitle}</p>
        </div>

        <div className="max-w-6xl mx-auto glass-bright-card rounded-3xl overflow-hidden">
          {/* Tab strip */}
          <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--border-bright)', scrollbarWidth: 'none' }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`tab-strip-btn ${activeTab === id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 md:p-8 min-h-[600px]">
            {activeTab === 'chat' && (
              <div className="animate-fade-in h-full">
                <ChatInterface />
              </div>
            )}

            {activeTab === 'evm' && (
              <div className="animate-fade-in">
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <ShieldCheck size={22} style={{ color: '#00d4aa' }} />
                    <h3 className="text-2xl font-bold text-[var(--foreground)]">Practice Voting</h3>
                  </div>
                  <p className="text-[var(--foreground-muted)] max-w-lg mx-auto">
                    Press the blue button next to your candidate&apos;s symbol. You will hear a beep and see the VVPAT slip print for 7 seconds.
                  </p>
                </div>
                <EVMSimulator />
              </div>
            )}

            {activeTab === 'ar' && (
              <div className="animate-fade-in h-full flex-1">
                <ArEvm />
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="animate-fade-in h-full flex-1">
                <VoteVision />
              </div>
            )}

            {activeTab === 'pathfinder' && (
              <div className="animate-fade-in h-full flex-1">
                <PollingPathfinder />
              </div>
            )}

            {activeTab === 'lawyer' && (
              <div className="animate-fade-in h-full flex-1">
                <ElectionLawyer />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-4 mt-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--foreground-muted)]">
          <div className="flex items-center gap-2 font-bold text-lg" style={{ background: 'linear-gradient(135deg,#f97316,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} aria-label="VoteSaathi Logo">
            VoteSaathi
          </div>
          <p>Built for India&apos;s 968M voters — Every Vote Counts.</p>
          <p>Powered by Gemini AI · ECI Guidelines</p>
        </div>
      </footer>
    </div>
  );
}
