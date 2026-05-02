'use client';

import { useState } from 'react';
import { Volume2, Printer } from 'lucide-react';

const CANDIDATES = [
  { id: 1, name: 'Aditi Sharma', symbol: '🌻' },
  { id: 2, name: 'Rahul Verma', symbol: '🚲' },
  { id: 3, name: 'Meena Devi', symbol: '🐘' },
  { id: 4, name: 'NOTA', symbol: '❌' },
];

export default function EVMSimulator() {
  const [activeLamp, setActiveLamp] = useState<number | null>(null);
  const [vvpatCandidate, setVvpatCandidate] = useState<typeof CANDIDATES[0] | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = (candidate: typeof CANDIDATES[0]) => {
    if (isVoting) return;
    setIsVoting(true);
    setActiveLamp(candidate.id);
    
    // Simulate the VVPAT printing and the long beep
    setTimeout(() => {
      setVvpatCandidate(candidate);
    }, 1000);

    setTimeout(() => {
      setActiveLamp(null);
      setVvpatCandidate(null);
      setIsVoting(false);
    }, 7000); // 7 seconds is the standard VVPAT display time
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-6 w-full max-w-5xl mx-auto">
      
      {/* EVM Ballot Unit */}
      <div className="w-full max-w-sm bg-slate-200 dark:bg-slate-800 rounded-xl p-4 shadow-2xl border-4 border-slate-300 dark:border-slate-700 relative">
        <div className="text-center mb-4">
          <div className="inline-block bg-slate-300 dark:bg-slate-700 px-4 py-1 rounded text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Ballot Unit
          </div>
        </div>

        <div className="space-y-2 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-inner">
          {CANDIDATES.map((candidate, idx) => (
            <div key={candidate.id} className="flex items-center justify-between p-2 border-b-2 border-slate-200 dark:border-slate-800 last:border-0">
              <div className="flex items-center gap-4 flex-1">
                <span className="font-bold text-lg w-6 text-slate-500">{idx + 1}</span>
                <span className="text-xl font-bold">{candidate.name}</span>
                <span className="text-2xl ml-auto mr-4">{candidate.symbol}</span>
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                {/* Red Lamp */}
                <div className={`w-4 h-4 rounded-full border border-red-900 shadow-inner transition-all duration-75 ${
                  activeLamp === candidate.id ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-red-950 opacity-20'
                }`} />
                
                {/* Blue Button */}
                <button
                  onClick={() => handleVote(candidate)}
                  disabled={isVoting}
                  className={`w-12 h-8 rounded-full border-2 border-slate-400 dark:border-slate-600 shadow-md transition-all active:scale-95 flex items-center justify-center ${
                    isVoting ? 'bg-blue-900 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 cursor-pointer'
                  }`}
                  aria-label={`Vote for ${candidate.name}`}
                >
                  <div className="w-8 h-4 bg-blue-400/30 rounded-full" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {isVoting && (
          <div className="absolute top-2 right-2 text-primary animate-pulse flex items-center gap-1">
            <Volume2 size={16} />
            <span className="text-xs font-bold">BEEEEEEP</span>
          </div>
        )}
        
        {/* Skip button for EVM */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
           <button 
              onClick={() => setActiveLamp(null)}
              className="bg-slate-300 dark:bg-slate-700 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
            >
              Skip Step
            </button>
        </div>
      </div>

      {/* VVPAT Unit */}
      <div className="w-full max-w-[250px] bg-slate-200 dark:bg-slate-800 rounded-xl p-4 shadow-2xl border-4 border-slate-300 dark:border-slate-700 h-[400px] flex flex-col items-center">
        <div className="text-center mb-6">
          <div className="inline-block bg-slate-300 dark:bg-slate-700 px-4 py-1 rounded text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            VVPAT
          </div>
        </div>

        <div className="w-48 h-64 bg-slate-900 border-8 border-slate-700 rounded relative overflow-hidden flex items-center justify-center">
          {/* Glass window reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 transform scale-150 pointer-events-none" />
          
          {/* Slip */}
          <div className={`w-32 h-40 bg-white shadow-lg p-3 flex flex-col items-center justify-center gap-2 transform transition-transform duration-1000 ${
            vvpatCandidate ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
            {vvpatCandidate && (
              <>
                <div className="text-xs text-slate-500 font-mono">SLIP: {Math.floor(Math.random() * 10000)}</div>
                <div className="font-bold text-lg text-black">{vvpatCandidate.name}</div>
                <div className="text-4xl">{vvpatCandidate.symbol}</div>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Printer size={18} />
            <span className="text-xs font-semibold uppercase">Verification Slip</span>
          </div>
        </div>
      </div>
    </div>
  );
}
