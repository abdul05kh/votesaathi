'use client';

import { motion, AnimatePresence, MotionValue, Variants } from 'framer-motion';

interface MatrixSceneProps {
  currentScene: number;
  direction: number;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  isSpeakingState: boolean;
  hyperspaceVariants: Variants;
}

export default function MatrixScene({
  currentScene,
  direction,
  rotateX,
  rotateY,
  isSpeakingState,
  hyperspaceVariants
}: MatrixSceneProps) {
  return (
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
  );
}
