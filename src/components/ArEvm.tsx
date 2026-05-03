'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArEvm() {
  const [isArActive, setIsArActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setIsArActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsArActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleVote = (candidateIndex: number) => {
    setVotedFor(candidateIndex);
    // Play beep sound
    const audio = new Audio('/beep.mp3'); // Assuming beep.mp3 exists or fallback
    audio.play().catch(() => console.log("Audio play failed"));
    
    setTimeout(() => {
      setVotedFor(null);
    }, 7000); // Reset after 7 seconds (VVPAT time)
  };

  const candidates = [
    { name: "Candidate A", symbol: "🍎" },
    { name: "Candidate B", symbol: "🚲" },
    { name: "Candidate C", symbol: "⚽" },
    { name: "NOTA", symbol: "❌" },
  ];

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center relative bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
      {!isArActive ? (
        <div className="text-center p-8 text-white">
          <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera size={48} className="text-cyan-400" />
          </div>
          <h3 className="text-3xl font-black mb-4">Summon Holographic EVM</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Place a full-scale 3D EVM in your room using Augmented Reality. Practice voting in real physical space.
          </p>
          <button
            onClick={startCamera}
            className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-full shadow-[0_0_30px_#22d3ee] hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 mx-auto"
            aria-label="Grant camera access to start AR hologram"
          >
            <Camera size={20} /> Grant Camera Access
          </button>
          {hasPermission === false && (
            <p className="text-red-400 mt-4 text-sm">Camera permission denied. Please allow camera access in your browser.</p>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden perspective-[1000px]">
          {/* AR Camera Feed Background */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />

          {/* Close AR Button */}
          <button 
            onClick={stopCamera}
            className="absolute top-4 right-4 z-50 p-2 bg-red-500 rounded-full text-white shadow-[0_0_15px_#ef4444]"
            aria-label="Close AR experience"
          >
            <XCircle size={24} />
          </button>

          {/* Holographic UI Overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-cyan-400/30 text-cyan-400 font-mono text-sm shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            AR TRACKING ACTIVE
          </div>

          {/* Pure CSS 3D Holographic EVM Container */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 1 }}
            className="relative z-30 transform-style-3d w-[320px] h-[500px]"
            style={{ rotateX: 10, rotateY: -10 }}
          >
            {/* Holographic Glowing Base */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full h-20 bg-cyan-500/30 blur-2xl rounded-full transform rotateX-75" />

            {/* Main EVM Body (Glassmorphic) */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-[0_0_50px_rgba(255,255,255,0.1),_inset_0_0_20px_rgba(255,255,255,0.2)] flex flex-col transform translateZ-10">
              
              {/* Header */}
              <div className="w-full h-12 border-b border-white/20 flex items-center justify-between px-2 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                  <span className="text-white text-xs font-bold tracking-widest opacity-80">READY</span>
                </div>
                <div className="text-white/50 text-xs font-mono">EVM V1.0</div>
              </div>

              {/* Candidate Buttons List */}
              <div className="flex-1 flex flex-col gap-3">
                {candidates.map((candidate, idx) => (
                  <div key={idx} className="flex bg-black/40 rounded-lg overflow-hidden border border-white/10 transform-style-3d transition-transform hover:translate-z-4 relative group">
                    {/* Index */}
                    <div className="w-8 flex items-center justify-center bg-white/5 text-white/50 font-bold border-r border-white/10">
                      {idx + 1}
                    </div>
                    {/* Details */}
                    <div className="flex-1 px-3 py-2 flex items-center justify-between text-white">
                      <span className="font-semibold text-sm">{candidate.name}</span>
                      <span className="text-xl bg-white/10 w-8 h-8 flex items-center justify-center rounded">{candidate.symbol}</span>
                    </div>
                    {/* Arrow/Separator */}
                    <div className="w-12 flex items-center justify-center text-slate-500">
                      →
                    </div>
                    {/* The Blue Button */}
                    <div className="w-16 flex items-center justify-center bg-black/60 p-2">
                      <button 
                        onClick={() => handleVote(idx)}
                        disabled={votedFor !== null}
                        aria-label={`Vote for ${candidate.name}`}
                        className={`w-full h-full rounded-full border-2 transition-all ${
                          votedFor === idx 
                            ? 'bg-red-500 border-red-400 shadow-[0_0_20px_#ef4444]' 
                            : votedFor !== null 
                              ? 'bg-blue-900 border-blue-800 opacity-50 cursor-not-allowed'
                              : 'bg-blue-600 border-blue-400 shadow-[0_0_15px_#2563eb] hover:bg-blue-500 active:scale-95'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VVPAT Hologram (Prints out above EVM when voted) */}
            <AnimatePresence>
              {votedFor !== null && (
                <motion.div 
                  initial={{ y: 0, opacity: 0, rotateX: -90, z: -50 }}
                  animate={{ y: -150, opacity: 1, rotateX: 0, z: 20 }}
                  exit={{ y: 0, opacity: 0, rotateX: -90 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] bg-white border-4 border-slate-200 rounded p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col items-center"
                >
                  <div className="text-black font-black text-xs mb-2 uppercase border-b-2 border-black w-full text-center pb-1">VVPAT Slip</div>
                  <div className="text-3xl mb-2">{candidates[votedFor].symbol}</div>
                  <div className="text-black font-bold text-sm">{candidates[votedFor].name}</div>
                  <CheckCircle2 size={32} className="text-emerald-500 mt-4" />
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </div>
  );
}
