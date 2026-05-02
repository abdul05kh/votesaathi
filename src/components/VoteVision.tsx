'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Volume2, Maximize, AlertCircle } from 'lucide-react';
import { analyzeBallot } from '@/lib/gemini';
import { useLanguage } from '@/context/LanguageContext';

export default function VoteVision() {
  const { language, speechVoiceCode } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied or unavailable. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechVoiceCode || 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    setInsight(null);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
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
    } catch (err) {
      setError("Failed to analyze the image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
      <div className="w-full bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl border-4 border-slate-800 h-[60vh] md:h-[500px]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800 p-6 text-center">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="text-lg">{error}</p>
            <button onClick={startCamera} className="mt-4 px-6 py-2 bg-primary rounded-full hover:bg-primary/90">
              Retry Camera
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
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
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all ${
              isAnalyzing ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-105'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Camera size={24} className="text-primary" />
                Scan Ballot / EVM
              </>
            )}
          </button>
        </div>
        
        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Results Area */}
      {insight && (
        <div className="w-full mt-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Maximize size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">VoteVision Insights</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">{insight}</p>
            <button onClick={() => speak(insight)} className="mt-4 flex items-center gap-2 text-primary font-medium hover:underline">
              <Volume2 size={18} /> Replay Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
