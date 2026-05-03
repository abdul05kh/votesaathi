'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { generateResponse } from '@/lib/gemini';
import { X, ChevronRight, ChevronDown, BrainCircuit } from 'lucide-react';
import SentientAI from './SentientAI';
import MatrixScene from './MatrixScene';
import { useVoiceoverContext } from '@/context/VoiceoverContext';

function matrixSpeak(text: string, lang: string, onEnd?: () => void) {
  if (typeof window === 'undefined') { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  if (!text) { onEnd?.(); return; }
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.92;
  utt.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.split('-')[0];
  const voice = voices.find(v => v.lang.startsWith(prefix) && v.name.toLowerCase().includes('female'))
             || voices.find(v => v.lang.startsWith(prefix));
  if (voice) utt.voice = voice;
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utt);
}

function matrixStop() {
  if (typeof window !== 'undefined') window.speechSynthesis.cancel();
}

function StarParticle() {
  const [coords] = useState(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <motion.div
      animate={{
        z: [0, 1000],
        opacity: [0, 1, 0],
        scale: [0, 5],
      }}
      transition={{
        duration: coords.duration,
        repeat: Infinity,
        delay: coords.delay,
        ease: "linear"
      }}
      className="absolute w-1 h-1 bg-cyan-400 rounded-full"
      style={{
        left: coords.left,
        top: coords.top,
        boxShadow: '0 0 20px 2px #22d3ee'
      }}
    />
  );
}

export default function ElectionTimeline() {
  const { t, speechVoiceCode } = useLanguage();
  const { setIsMatrixActive } = useVoiceoverContext();
  
  const [isActive, setIsActive] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition('en-IN');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const stateRef = useRef({
    scene: 0,
    isSpeaking: false,
    isTransitioning: false,
  });

  const scenes = useMemo(() => [
    { title: t.scene1Title, desc: t.scene1Desc },
    { title: t.scene2Title, desc: t.scene2Desc },
    { title: t.scene3Title, desc: t.scene3Desc },
    { title: t.scene4Title, desc: t.scene4Desc },
    { title: t.scene5Title, desc: t.scene5Desc },
  ], [t]);

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      setIsMatrixActive(true);
      stateRef.current = { scene: 0, isSpeaking: true, isTransitioning: true };
      
      const timer = setTimeout(() => {
        setCurrentScene(0);
        setIsSpeakingState(true);
        
        matrixStop();
        matrixSpeak(scenes[0].desc, speechVoiceCode, () => {
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
        });
        stateRef.current.isTransitioning = false;
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setIsMatrixActive(false);
      matrixStop();
    }
  }, [isActive, speechVoiceCode, scenes, setIsMatrixActive]);

  const advanceScene = useCallback(() => {
    matrixStop();
    stateRef.current.isSpeaking = false;
    stateRef.current.isTransitioning = false;
    setIsSpeakingState(false);

    if (stateRef.current.scene < scenes.length - 1) {
      stateRef.current.isTransitioning = true;
      stateRef.current.isSpeaking = true;
      const next = stateRef.current.scene + 1;
      stateRef.current.scene = next;

      setCurrentScene(next);
      setIsSpeakingState(true);

      setTimeout(() => {
        matrixStop();
        matrixSpeak(scenes[next].desc, speechVoiceCode, () => {
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
        });
        stateRef.current.isTransitioning = false;
      }, 1200);
    } else {
      setIsActive(false);
    }
  }, [scenes, speechVoiceCode]);

  const goBackScene = useCallback(() => {
    if (stateRef.current.isSpeaking || stateRef.current.isTransitioning || isListening || isAiThinking) return;

    if (stateRef.current.scene > 0) {
      stateRef.current.isTransitioning = true;
      stateRef.current.isSpeaking = true;
      const prev = stateRef.current.scene - 1;
      stateRef.current.scene = prev;

      setCurrentScene(prev);
      setIsSpeakingState(true);

      setTimeout(() => {
        matrixStop();
        matrixSpeak(scenes[prev].desc, speechVoiceCode, () => {
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
        });
        stateRef.current.isTransitioning = false;
      }, 1200);
    }
  }, [scenes, speechVoiceCode, isListening, isAiThinking]);

  const handleAskAI = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }
    
    matrixStop();
    setIsSpeakingState(false);
    stateRef.current.isSpeaking = false;
    
    startListening(async (text) => {
      setIsAiThinking(true);
      stateRef.current.isSpeaking = true;

      try {
        const response = await generateResponse(text, 'en');
        const finalResponse = response || "I&apos;m having trouble connecting right now.";
        setAiResponse(finalResponse);
        setIsAiThinking(false);
        setIsSpeakingState(true);

        matrixStop();
        matrixSpeak(finalResponse, speechVoiceCode, () => {
          setAiResponse(null);
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
        });
      } catch {
        setIsAiThinking(false);
        stateRef.current.isSpeaking = false;
      }
    });
  }, [isListening, stopListening, speechVoiceCode, startListening]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isActive) return;
    if (Math.abs(e.deltaY) < 40) return;

    if (e.deltaY > 0) {
      advanceScene();
    } else if (e.deltaY < 0) {
      goBackScene();
    }
  }, [isActive, advanceScene, goBackScene]);

  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const delta = touchStartY.current - touchEndY;
    if (Math.abs(delta) > 50) {
      if (delta > 0) advanceScene();
      else goBackScene();
    }
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  
  const rotateX = useTransform(smoothY, [-1, 1], [15, -15]);
  const rotateY = useTransform(smoothX, [-1, 1], [-15, 15]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  }, [isActive, mouseX, mouseY]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        const normalizedY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
        const normalizedX = Math.max(-1, Math.min(1, e.gamma / 45));
        mouseX.set(normalizedX);
        mouseY.set(normalizedY);
      }
    };
    
    const deviceEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof deviceEvent.requestPermission === 'function') {
      deviceEvent.requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isActive, mouseX, mouseY]);

  const hyperspaceVariants = {
    enter: (direction: number) => ({
      scale: direction > 0 ? 0.01 : 10,
      opacity: 0,
      rotateZ: direction > 0 ? -45 : 45,
      filter: 'blur(20px) brightness(200%) hue-rotate(90deg)'
    }),
    center: {
      zIndex: 1,
      scale: 1,
      opacity: 1,
      rotateZ: 0,
      filter: 'blur(0px) brightness(100%) hue-rotate(0deg)',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as any
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      scale: direction < 0 ? 0.01 : 10,
      opacity: 0,
      rotateZ: direction < 0 ? 45 : -45,
      filter: 'blur(20px) brightness(0%) hue-rotate(-90deg)',
      transition: {
        duration: 1.2,
        ease: [0.7, 0, 0.84, 0] as any
      }
    })
  };

  const [direction, setDirection] = useState(1);
  const prevSceneRef = useRef(0);
  
  useEffect(() => {
    if (currentScene !== prevSceneRef.current) {
      setDirection(currentScene > prevSceneRef.current ? 1 : -1);
      prevSceneRef.current = currentScene;
    }
  }, [currentScene]);

  return (
    <>
      <section id="learn-to-vote" className="min-h-[80vh] flex flex-col items-center justify-center bg-[#020617] text-white relative overflow-hidden border-y border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#020617] to-[#020617] z-0" />
        
        <div className="z-10 text-center px-4 max-w-4xl">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], filter: ['drop-shadow(0 0 10px #3b82f6)', 'drop-shadow(0 0 30px #3b82f6)', 'drop-shadow(0 0 10px #3b82f6)'] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              THE ELECTION <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">MATRIX</span>
            </h2>
          </motion.div>
          <p className="text-xl md:text-3xl text-slate-300 mb-12 font-light tracking-wide">
            A mind-bending, cinematic journey through the democratic core.
          </p>
          <button 
            onClick={() => setIsActive(true)}
            aria-label="Enter the Election Matrix"
            className="px-10 py-5 bg-white text-slate-900 font-black tracking-widest uppercase text-xl rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:shadow-[0_0_100px_rgba(255,255,255,0.8)] hover:scale-110 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            Enter The Void
          </button>
        </div>
      </section>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 overflow-hidden flex flex-col justify-center items-center perspective-[2000px]"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseMove={handleMouseMove}
            role="dialog"
            aria-modal="true"
            aria-label="Election Matrix Interactive Experience"
          >
            {/* Speeding Starfield Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <StarParticle key={i} />
              ))}
            </div>

            <SentientAI 
              isListening={isListening} 
              isAiThinking={isAiThinking} 
              isSpeakingState={isSpeakingState} 
              onAskAI={handleAskAI} 
            />

            <div className="absolute top-6 right-6 z-[130]">
              <button
                onClick={() => setIsActive(false)}
                aria-label="Close Matrix"
                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:rotate-90 rounded-2xl text-white/50 hover:text-white backdrop-blur-md transition-all border border-white/10 shadow-lg"
                title="Exit Matrix"
              >
                <X size={20} />
              </button>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center">
              <span className={`text-sm mb-3 uppercase tracking-[0.3em] font-black ${isListening ? 'text-cyan-400' : isAiThinking ? 'text-purple-400' : isSpeakingState ? 'text-red-400' : 'text-emerald-400'}`}>
                {isListening ? "Listening..." : isAiThinking ? "Thinking..." : isSpeakingState ? "Narrating..." : "Scroll To Proceed"}
              </span>
              <motion.div
                animate={isSpeakingState || isAiThinking || isListening ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : { y: [0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {isSpeakingState || isAiThinking || isListening ? (
                  <div className={`w-8 h-8 rounded-full border-4 ${isListening ? 'border-cyan-400' : isAiThinking ? 'border-purple-500' : 'border-red-500'}`} />
                ) : (
                  <ChevronDown size={48} className="text-emerald-400" />
                )}
              </motion.div>
            </div>

            <MatrixScene 
              currentScene={currentScene}
              direction={direction}
              rotateX={rotateX}
              rotateY={rotateY}
              isSpeakingState={isSpeakingState}
              hyperspaceVariants={hyperspaceVariants}
            />

            <div className="absolute bottom-[4%] left-0 right-0 z-[120] px-4 sm:px-6">
              <div className="max-w-4xl mx-auto bg-[#0b1120]/90 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden group min-h-[220px] flex flex-col justify-center">
                {/* ECI Side Accent */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#f97316] via-[#ffffff] to-[#00d4aa] opacity-80" />
                
                <AnimatePresence mode="wait">
                  {aiResponse ? (
                    <motion.div
                      key="ai-response"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-left"
                    >
                      <h3 className="text-sm font-black text-cyan-400 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <BrainCircuit size={16} /> Matrix Intelligence
                      </h3>
                      <p className="text-xl md:text-3xl text-white font-medium leading-relaxed">
                        {aiResponse}
                      </p>
                    </motion.div>
                  ) : transcript ? (
                    <motion.div
                      key="user-transcript"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-left"
                    >
                      <h3 className="text-sm font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">User Query</h3>
                      <p className="text-xl md:text-3xl text-white italic font-light">&quot;{transcript}&quot;</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentScene}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-left"
                    >
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                          <h2 className="text-2xl md:text-4xl font-black mb-3 text-white tracking-tight flex items-center gap-4">
                            <span className="text-[#f97316] opacity-50 text-xl">0{currentScene + 1}</span>
                            {scenes[currentScene].title}
                          </h2>
                          <p className="text-base md:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
                            {scenes[currentScene].desc}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => advanceScene()}
                            disabled={isListening || isAiThinking}
                            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black tracking-widest uppercase text-sm transition-all shadow-2xl ${
                              isListening || isAiThinking
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-[#00d4aa] text-black hover:scale-105 active:scale-95 hover:shadow-[#00d4aa]/30'
                            }`}
                          >
                            {currentScene < scenes.length - 1 ? 'Next Phase' : 'Complete'}
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress dot indicators */}
                <div className="flex gap-2 mt-8 justify-start">
                  {scenes.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-500 ${i === currentScene ? 'w-8 bg-[#f97316]' : 'w-2 bg-white/10'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900 z-[120]">
              <motion.div 
                className="h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
