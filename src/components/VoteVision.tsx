'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Volume2, Maximize, AlertCircle } from 'lucide-react';
import { analyzeBallot } from '@/lib/gemini';
import { useLanguage } from '@/context/LanguageContext';

export default function VoteVision() {
  const { language, speechVoiceCode } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Starts the camera stream and attaches it to the video element.
   * Handles cleanup of previous streams if necessary.
   */
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch {
      setError("Camera access denied or unavailable. Please allow camera permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  /**
   * Synthesizes speech from text using the Web Speech API.
   * @param text The text to read aloud.
   */
  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechVoiceCode || 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }, [speechVoiceCode]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    setInsight(null);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      const response = await analyzeBallot(base64Image, language);
      const insightText = response || "No insight generated. Please try scanning again.";
      setInsight(insightText);
      speak(insightText);
    } catch {
      setError("Failed to analyze the image.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [language, speak]);

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Election Multi-Modal Analysis</h3>
        <p className="text-slate-500 dark:text-slate-400">Scan ID documents or Voter Slips for instant AI verification</p>
      </div>
      <div className="w-full bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl border-4 border-slate-800 h-[60vh] md:h-[500px]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800 p-6 text-center">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="text-lg">{error}</p>
            <button onClick={startCamera} className="mt-4 px-6 py-2 bg-primary rounded-full hover:bg-primary/90" aria-label="Retry camera access">
              Retry Camera
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
            aria-label="Live camera preview for document scanning"
          />
        )}
        
        {/* Overlay Scanner Frame */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] border-2 border-white/30 rounded-2xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl -mb-1 -mr-1"></div>
          </div>
        </div>
        
        {/* Analyze Button Overlay */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <button 
            onClick={captureAndAnalyze}
            disabled={isAnalyzing || !!error}
            aria-label={isAnalyzing ? "Analyzing document" : "Scan Voter ID or Aadhaar card"}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all ${
              isAnalyzing ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-105'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                Verifying Document...
              </>
            ) : (
              <>
                <Camera size={24} className="text-primary" aria-hidden="true" />
                Scan Voter ID / Aadhaar
              </>
            )}
          </button>
        </div>
        
        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Results Area */}
      {insight && (
        <div className="w-full mt-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in flex items-start gap-4 glass">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Maximize size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Document Verification Insights</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">{insight}</p>
            <button onClick={() => speak(insight)} className="mt-4 flex items-center gap-2 text-primary font-medium hover:underline" aria-label="Replay audio analysis">
              <Volume2 size={18} /> Replay Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
