'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

type Language = 'en' | 'hi' | 'te' | 'bn' | 'ta';

const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' }
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group z-50">
      <button 
        aria-label="Select Language"
        className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md border border-slate-200 rounded-full hover:bg-white/80 transition-colors shadow-sm"
      >
        <Globe size={18} className="text-primary" />
        <span className="font-semibold text-slate-700">
          {languages.find(l => l.code === language)?.name}
        </span>
      </button>

      <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            aria-label={`Change language to ${lang.name}`}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 ${
              language === lang.code ? 'text-primary bg-primary/5' : 'text-slate-600'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
