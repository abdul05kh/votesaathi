'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ChatInterface from '@/components/ChatInterface';
import EVMSimulator from '@/components/EVMSimulator';
import ArEvm from '@/components/ArEvm';
import AccessibilityToggle from '@/components/AccessibilityToggle';
import ElectionTimeline from '@/components/ElectionTimeline';
import FloatingStickers from '@/components/FloatingStickers';
import { ShieldCheck, MessageSquare, Box, ArrowDown, Camera, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import VoteVision from '@/components/VoteVision';
import PollingPathfinder from '@/components/PollingPathfinder';

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chat' | 'evm' | 'ar' | 'vision' | 'pathfinder'>('chat');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-transparent text-slate-800 overflow-x-hidden">
      <FloatingStickers />
      <AccessibilityToggle />
      
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto glass-bright p-8 md:p-16 rounded-[3rem]"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
            Welcome to VoteSaathi
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            {t.heroTitle1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t.heroTitle2}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => scrollToSection('learn-to-vote')}
              className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
            >
              {t.startLearning}
              <ArrowDown size={20} />
            </button>
            <button 
              onClick={() => scrollToSection('practice-zone')}
              className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg border-2 border-slate-200 hover:border-primary transition-all shadow-md"
            >
              {t.trySimulator}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Educational Timeline Section */}
      <ElectionTimeline />

      {/* Interactive Practice Zone */}
      <section id="practice-zone" className="py-24 px-4 bg-white border-t border-slate-200 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">{t.practiceTitle}</h2>
            <p className="text-lg text-slate-600">
              {t.practiceSubtitle}
            </p>
          </div>

          <div className="w-full glass-bright-card rounded-3xl border border-slate-200 overflow-hidden relative z-20">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-lg transition-colors ${
                  activeTab === 'chat' 
                    ? 'text-accent border-b-2 border-accent bg-accent/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare size={20} />
                Saathi Bot
              </button>
              <button
                onClick={() => setActiveTab('evm')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-lg transition-colors ${
                  activeTab === 'evm' 
                    ? 'text-accent border-b-2 border-accent bg-accent/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Box size={20} />
                EVM Simulator
              </button>
              <button
                onClick={() => setActiveTab('ar')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-lg transition-colors ${
                  activeTab === 'ar' 
                    ? 'text-accent border-b-2 border-accent bg-accent/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera size={20} />
                AR Hologram
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-lg transition-colors ${
                  activeTab === 'vision' 
                    ? 'text-accent border-b-2 border-accent bg-accent/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera size={20} />
                VoteVision
              </button>
              <button
                onClick={() => setActiveTab('pathfinder')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-lg transition-colors ${
                  activeTab === 'pathfinder' 
                    ? 'text-accent border-b-2 border-accent bg-accent/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin size={20} />
                Booth Locator
              </button>
            </div>

            {/* Content Area */}
            <div className="bg-slate-50/80 p-4 md:p-8 min-h-[600px]">
              {activeTab === 'chat' ? (
                <div className="animate-fade-in h-full">
                  <ChatInterface />
                </div>
              ) : activeTab === 'evm' ? (
                <div className="animate-fade-in">
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold flex items-center justify-center gap-2 text-slate-900">
                      <ShieldCheck className="text-secondary" />
                      Practice Voting
                    </h3>
                    <p className="text-slate-600 mt-2">
                      Press the blue button next to your candidate's symbol. You will hear a beep and see the VVPAT slip print for 7 seconds to verify your vote.
                    </p>
                  </div>
                  <EVMSimulator />
                </div>
              ) : activeTab === 'ar' ? (
                <div className="animate-fade-in h-full flex-1">
                  <ArEvm />
                </div>
              ) : activeTab === 'vision' ? (
                <div className="animate-fade-in h-full flex-1">
                  <VoteVision />
                </div>
              ) : (
                <div className="animate-fade-in h-full flex-1">
                  <PollingPathfinder />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
