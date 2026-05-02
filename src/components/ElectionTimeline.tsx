'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useVoiceover } from '@/hooks/useVoiceover';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { generateResponse } from '@/lib/gemini';
import AudioVisualizer from '@/components/AudioVisualizer';
import { X, ChevronDown, ChevronUp, Mic, MicOff, BrainCircuit } from 'lucide-react';

export default function ElectionTimeline() {
  const { t } = useLanguage();
  const { speak, stop } = useVoiceover();
  
  const [isActive, setIsActive] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  
  // Sentient AI State
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition('en-IN');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Robust state refs to prevent any closure staleness from rapid scroll events
  const stateRef = useRef({
    scene: 0,
    isSpeaking: false,
    isTransitioning: false,
  });

  const scenes = [
    { title: t.scene1Title, desc: t.scene1Desc },
    { title: t.scene2Title, desc: t.scene2Desc },
    { title: t.scene3Title, desc: t.scene3Desc },
    { title: t.scene4Title, desc: t.scene4Desc },
    { title: t.scene5Title, desc: t.scene5Desc },
  ];

  // Lock body scroll and initialize
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      // Reset state
      stateRef.current = { scene: 0, isSpeaking: true, isTransitioning: true };
      setCurrentScene(0);
      setIsSpeakingState(true);
      
      // Delay first speech slightly for entry animation
      setTimeout(() => {
        stop(); // Cancel any existing speech
        speak(scenes[0].desc, () => {
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
        });
        stateRef.current.isTransitioning = false;
      }, 1500);

    } else {
      document.body.style.overflow = '';
      stop();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  const advanceScene = useCallback(() => {
    if (stateRef.current.isSpeaking || stateRef.current.isTransitioning) return;
    
    if (stateRef.current.scene < scenes.length - 1) {
      stateRef.current.isTransitioning = true;
      stateRef.current.isSpeaking = true;
      const next = stateRef.current.scene + 1;
      stateRef.current.scene = next;
      
      setCurrentScene(next);
      setIsSpeakingState(true);
      
      // Add artificial delay for the hyperspace transition before speaking
      setTimeout(() => {
        stop(); // Cancel any existing speech
        speak(scenes[next].desc, () => {
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
        });
        stateRef.current.isTransitioning = false;
      }, 1200);
    } else {
      setIsActive(false); // Finish
    }
  }, [scenes, speak]);

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
        stop(); // Cancel any existing speech
        speak(scenes[prev].desc, () => {
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
        });
        stateRef.current.isTransitioning = false;
      }, 1200);
    }
  }, [scenes, speak, isListening, isAiThinking]);

  const handleAskAI = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }
    
    // Interrupt current flow
    stop();
    setIsSpeakingState(false);
    stateRef.current.isSpeaking = false;
    
    startListening(async (text) => {
      setIsAiThinking(true);
      stateRef.current.isSpeaking = true; // Lock the matrix
      
      try {
        const response = await generateResponse(text, 'en');
        const finalResponse = response || "I'm having trouble connecting to my matrix core right now.";
        setAiResponse(finalResponse);
        setIsAiThinking(false);
        setIsSpeakingState(true);
        
        stop(); // Cancel any existing speech
        speak(finalResponse, () => {
          setAiResponse(null);
          stateRef.current.isSpeaking = false;
          setIsSpeakingState(false);
          // Auto-resume scene narration if desired, or let user scroll
        });
      } catch (e) {
        setIsAiThinking(false);
        stateRef.current.isSpeaking = false;
      }
    });
  }, [isListening, stopListening, stop, startListening, speak]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isActive) return;
    // Debounce hypersensitive trackpads
    if (Math.abs(e.deltaY) < 40) return;

    if (e.deltaY > 0) {
      advanceScene();
    } else if (e.deltaY < 0) {
      goBackScene();
    }
  }, [isActive, advanceScene, goBackScene]);

  // Touch handling for mobile
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

  // Gyroscopic & Kinetic Gravity Engine
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  
  // Transform mapped values to subtle 3D rotation
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
    if (!isActive) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        const normalizedY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
        const normalizedX = Math.max(-1, Math.min(1, e.gamma / 45));
        mouseX.set(normalizedX);
        mouseY.set(normalizedY);
      }
    };
    
    // Request permission for iOS 13+ devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
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

  // Hyperspace Variants
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
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number] // Custom deep ease-out
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
        ease: [0.7, 0, 0.84, 0] as [number, number, number, number] // Custom deep ease-in
      }
    })
  };

  // Keep track of direction for animation
  const prevSceneRef = useRef(0);
  const direction = currentScene > prevSceneRef.current ? 1 : -1;
  useEffect(() => { prevSceneRef.current = currentScene; }, [currentScene]);

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
          >
            {/* Speeding Starfield Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    z: [0, 1000],
                    opacity: [0, 1, 0],
                    scale: [0, 5],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: '0 0 20px 2px #22d3ee'
                  }}
                />
              ))}
            </div>

            <AudioVisualizer isSpeaking={isSpeakingState} />

            <button 
              onClick={() => setIsActive(false)}
              className="absolute top-8 right-8 z-[110] bg-white/10 hover:bg-white/20 hover:rotate-90 p-4 rounded-full text-white backdrop-blur-md transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              title="Close Matrix"
            >
              <X size={32} />
            </button>

            <button 
              onClick={() => setIsActive(false)}
              className="absolute top-8 right-28 z-[110] bg-white/10 hover:bg-white/20 px-6 py-4 rounded-full text-white backdrop-blur-md transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] font-bold tracking-widest uppercase text-sm"
            >
              Skip Experience
            </button>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center">
              <span className={`text-sm mb-3 uppercase tracking-[0.3em] font-black ${isSpeakingState || isAiThinking || isListening ? 'text-red-400' : 'text-emerald-400'}`}>
                {isListening ? "Listening to you..." : isAiThinking ? "Matrix Processing..." : isSpeakingState ? "System Speaking..." : "Scroll To Proceed"}
              </span>
              <motion.div
                animate={isSpeakingState || isAiThinking || isListening ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : { y: [0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {isSpeakingState || isAiThinking || isListening ? (
                  <div className={`w-8 h-8 rounded-full border-4 ${isListening ? 'border-cyan-400 shadow-[0_0_20px_#22d3ee]' : isAiThinking ? 'border-purple-500 shadow-[0_0_20px_#a855f7]' : 'border-red-500 shadow-[0_0_20px_#ef4444]'}`} />
                ) : (
                  <ChevronDown size={48} className="text-emerald-400 drop-shadow-[0_0_15px_#34d399]" />
                )}
              </motion.div>
            </div>

            {/* AI Talk Button */}
            <button
              onClick={handleAskAI}
              className={`absolute bottom-8 right-8 z-[120] p-5 rounded-full backdrop-blur-md transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
                isListening 
                  ? 'bg-cyan-500 text-white shadow-[0_0_50px_#22d3ee] scale-110' 
                  : isAiThinking
                  ? 'bg-purple-600 text-white shadow-[0_0_50px_#9333ea] animate-pulse'
                  : 'bg-white/10 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {isListening ? <Mic size={28} className="animate-pulse" /> : isAiThinking ? <BrainCircuit size={28} className="animate-spin" /> : <MicOff size={28} />}
            </button>

            {/* The Hyperspace Matrix Core */}
            <motion.div 
              style={{ rotateX, rotateY }}
              className="absolute inset-0 flex items-center justify-center transform-style-3d pointer-events-none"
            >
              <AnimatePresence custom={direction} mode="sync">
                
                {/* === SCENE 1 === */}
                {currentScene === 0 && (
                  <motion.div 
                    key="scene0" custom={direction} variants={hyperspaceVariants} initial="enter" animate="center" exit="exit"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Infinite Grid Floor */}
                    <motion.div 
                      animate={{ backgroundPosition: ['0px 0px', '0px 100px'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute w-[300vw] h-[300vh] border border-cyan-500/20 bg-[linear-gradient(rgba(34,211,238,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(34,211,238,0.1)_2px,transparent_2px)] bg-[size:100px_100px] transform rotateX-75 translateY-64 shadow-[0_0_150px_inset_#0891b2]" 
                    />
                    
                    <div className="relative z-10 w-[500px] h-[600px] bg-black/40 backdrop-blur-3xl border-2 border-cyan-400/50 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(34,211,238,0.2)]">
                      <motion.div animate={{ rotateY: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-32 h-40 border-4 border-dashed border-cyan-400 rounded-xl mb-12 flex items-center justify-center relative">
                        <div className="absolute inset-2 bg-cyan-400/20" />
                        <div className="w-20 h-2 bg-cyan-400 rounded absolute top-8" />
                        <div className="w-16 h-2 bg-cyan-400 rounded absolute top-14" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* === SCENE 2 === */}
                {currentScene === 1 && (
                  <motion.div 
                    key="scene1" custom={direction} variants={hyperspaceVariants} initial="enter" animate="center" exit="exit"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="relative w-[600px] h-[350px] bg-gradient-to-tr from-blue-900/60 to-indigo-900/60 backdrop-blur-3xl border-4 border-blue-400 rounded-[3rem] p-8 shadow-[0_0_150px_rgba(96,165,250,0.5)] overflow-hidden">
                      <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                      <div className="flex gap-8 h-full items-center">
                        <div className="w-48 h-full bg-blue-400/20 rounded-2xl border-2 border-blue-400/50 flex items-center justify-center relative overflow-hidden">
                          <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-2 bg-blue-400 shadow-[0_0_20px_#60a5fa]" />
                        </div>
                        <div className="flex-1 flex flex-col gap-6">
                          <div className="w-full h-8 bg-blue-400/80 rounded-lg shadow-[0_0_15px_#60a5fa]" />
                          <div className="w-3/4 h-4 bg-blue-400/50 rounded" />
                          <div className="w-5/6 h-4 bg-blue-400/50 rounded" />
                          <div className="w-1/2 h-4 bg-blue-400/50 rounded" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* === SCENE 3 === */}
                {currentScene === 2 && (
                  <motion.div 
                    key="scene2" custom={direction} variants={hyperspaceVariants} initial="enter" animate="center" exit="exit"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="relative w-[600px] h-[600px] flex items-center justify-center">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <motion.div
                          key={i}
                          animate={isSpeakingState ? { scale: [1, 1.1 + (i * 0.05), 1], opacity: [0.2, 0.8 - (i * 0.1), 0.2] } : { scale: 1, opacity: 0.3 }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                          className="absolute border-4 border-emerald-400 rounded-full shadow-[0_0_50px_#34d399]"
                          style={{ width: `${i * 15}%`, height: `${i * 15}%` }}
                        />
                      ))}
                      <motion.div animate={{ rotateZ: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full border-t-8 border-r-8 border-emerald-400 rounded-full opacity-50" />
                      <div className="w-32 h-32 bg-emerald-400 rounded-full blur-[40px]" />
                    </div>
                  </motion.div>
                )}

                {/* === SCENE 4 === */}
                {currentScene === 3 && (
                  <motion.div 
                    key="scene3" custom={direction} variants={hyperspaceVariants} initial="enter" animate="center" exit="exit"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-[450px] bg-[#0f172a] border-4 border-[#334155] rounded-3xl overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)] relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                      <div className="w-full h-12 bg-[#1e293b] border-b-4 border-[#0f172a] flex items-center justify-center">
                        <div className="w-20 h-2 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]" />
                      </div>
                      <div className="p-8 flex flex-col gap-6">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex justify-between items-center bg-[#1e293b] p-6 rounded-2xl border border-[#334155] shadow-inner">
                            <div className="w-32 h-6 bg-[#475569] rounded-lg" />
                            {i === 2 ? (
                              <motion.div 
                                animate={isSpeakingState ? { backgroundColor: ["#1d4ed8", "#60a5fa", "#1d4ed8"], scale: [1, 1.1, 1] } : { backgroundColor: "#1d4ed8" }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="w-24 h-16 rounded-xl shadow-[0_0_50px_#3b82f6] border-2 border-blue-300 flex items-center justify-center"
                              >
                                <div className="w-12 h-3 bg-white/80 rounded-full shadow-lg" />
                              </motion.div>
                            ) : (
                              <div className="w-24 h-16 bg-[#334155] rounded-xl border-b-4 border-[#1e293b]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* === SCENE 5 === */}
                {currentScene === 4 && (
                  <motion.div 
                    key="scene4" custom={direction} variants={hyperspaceVariants} initial="enter" animate="center" exit="exit"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="relative w-[500px] h-[700px] bg-black/80 border-8 border-[#1e293b] rounded-[3rem] overflow-hidden flex justify-center shadow-[0_0_150px_rgba(255,255,255,0.1)]">
                      <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-[#0f172a] to-transparent z-20 flex items-center justify-center border-b border-white/10">
                        <div className="w-64 h-4 bg-black rounded-full shadow-inner" />
                      </div>
                      
                      <motion.div 
                        animate={{ y: ["-100%", "20%", "20%", "100%"] }}
                        transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
                        className="absolute top-24 w-[350px] h-[450px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center z-10 rounded-b-lg border-x border-b border-slate-300"
                      >
                        <div className="w-24 h-24 bg-slate-100 rounded-full mb-8 border-8 border-emerald-500 shadow-[0_0_30px_#10b981]" />
                        <div className="w-full h-6 bg-slate-800 rounded mb-6" />
                        <div className="w-4/5 h-4 bg-slate-400 rounded mb-4" />
                        <div className="w-3/5 h-4 bg-slate-400 rounded mb-12" />
                        
                        <div className="w-20 h-20 rounded-full border-8 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_#10b981]">
                          <div className="w-10 h-10 bg-emerald-500 rounded-sm transform rotate-45" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Cinematic Foreground Text */}
            <div className="absolute bottom-[20%] left-0 right-0 z-[120] px-8 pointer-events-none">
              <div className="max-w-5xl mx-auto text-center bg-black/40 backdrop-blur-lg p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <AnimatePresence mode="wait">
                  {aiResponse ? (
                    <motion.div
                      key="ai-response"
                      initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.5 }}
                      className="border-l-4 border-cyan-400 pl-6 text-left"
                    >
                      <h3 className="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <BrainCircuit size={20} /> Matrix Intelligence
                      </h3>
                      <p className="text-2xl md:text-4xl text-white font-light leading-relaxed">
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
                      <h3 className="text-lg font-bold text-slate-400 mb-2">You asked:</h3>
                      <p className="text-2xl text-white italic">"{transcript}"</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentScene}
                      initial={{ y: 30, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -30, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <h2 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                        {scenes[currentScene].title}
                      </h2>
                      <p className="text-2xl md:text-3xl text-cyan-200 font-light max-w-4xl mx-auto leading-relaxed">
                        {scenes[currentScene].desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Sci-Fi Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900 z-[120]">
              <motion.div 
                className="h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
