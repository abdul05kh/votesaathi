'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'te' | 'bn' | 'ta';

interface Translations {
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  startLearning: string;
  trySimulator: string;
  practiceTitle: string;
  practiceSubtitle: string;
  scene1Title: string;
  scene1Desc: string;
  scene2Title: string;
  scene2Desc: string;
  scene3Title: string;
  scene3Desc: string;
  scene4Title: string;
  scene4Desc: string;
  scene5Title: string;
  scene5Desc: string;
}

const dictionaries: Record<Language, Translations> = {
  en: {
    heroTitle1: "Every Vote Has a ",
    heroTitle2: "Voice.",
    heroSubtitle: "Your comprehensive, accessible guide to the Indian election process. Learn how to vote, practice using the EVM, and get answers.",
    startLearning: "Start Learning Process",
    trySimulator: "Try Simulator",
    practiceTitle: "Practice & Ask",
    practiceSubtitle: "Put your knowledge to the test. Talk to our AI Saathi or try the EVM Simulator.",
    scene1Title: "Register to Vote",
    scene1Desc: "If you're 18+, fill Form 6 on the ECI portal to get your name on the Electoral Roll. You can't vote without being registered!",
    scene2Title: "Bring Your ID",
    scene2Desc: "On polling day, grab your Voter ID or Aadhaar card. Leave your mobile phone at home—it's not allowed inside!",
    scene3Title: "The Indelible Ink",
    scene3Desc: "The polling officer will check your ID and mark your left forefinger with special ink. It's the proud mark of a voter!",
    scene4Title: "Press The Button",
    scene4Desc: "Step into the compartment. Press the blue button next to your candidate on the EVM. You'll hear a loud BEEP.",
    scene5Title: "Verify Your Choice",
    scene5Desc: "Look at the VVPAT machine. A slip will show your vote for 7 seconds. You did it—you just shaped the future of India!"
  },
  hi: {
    heroTitle1: "हर वोट की अपनी ",
    heroTitle2: "आवाज़ है।",
    heroSubtitle: "भारतीय चुनाव प्रक्रिया के लिए आपका सुलभ मार्गदर्शन। जानें कि वोट कैसे करें, EVM का अभ्यास करें और उत्तर प्राप्त करें।",
    startLearning: "सीखने की प्रक्रिया शुरू करें",
    trySimulator: "सिम्युलेटर आज़माएं",
    practiceTitle: "अभ्यास करें और पूछें",
    practiceSubtitle: "अपने ज्ञान का परीक्षण करें। हमारे AI साथी से बात करें या EVM सिम्युलेटर आज़माएं।",
    scene1Title: "वोट के लिए पंजीकरण करें",
    scene1Desc: "यदि आप 18+ हैं, तो निर्वाचक नामावली में अपना नाम दर्ज कराने के लिए ECI पोर्टल पर फॉर्म 6 भरें। पंजीकृत हुए बिना आप वोट नहीं दे सकते!",
    scene2Title: "अपना पहचान पत्र लाएं",
    scene2Desc: "मतदान के दिन, अपना वोटर आईडी या आधार कार्ड लें। अपना मोबाइल फोन घर पर छोड़ दें—यह अंदर जाने की अनुमति नहीं है!",
    scene3Title: "अमिट स्याही",
    scene3Desc: "मतदान अधिकारी आपकी आईडी की जांच करेगा और आपकी बाईं तर्जनी पर विशेष स्याही लगाएगा। यह एक मतदाता का गर्व का निशान है!",
    scene4Title: "बटन दबाएं",
    scene4Desc: "कम्पार्टमेंट में कदम रखें। EVM पर अपने उम्मीदवार के बगल में नीला बटन दबाएं। आपको एक तेज़ BEEP सुनाई देगी।",
    scene5Title: "अपनी पसंद सत्यापित करें",
    scene5Desc: "VVPAT मशीन को देखें। एक पर्ची 7 सेकंड के लिए आपका वोट दिखाएगी। आपने कर दिखाया—आपने अभी भारत के भविष्य को आकार दिया है!"
  },
  te: {
    heroTitle1: "ప్రతి ఓటుకు ఒక ",
    heroTitle2: "వాయిస్ ఉంది.",
    heroSubtitle: "భారత ఎన్నికల ప్రక్రియకు మీ సమగ్ర మార్గదర్శి. ఓటు వేయడం ఎలాగో తెలుసుకోండి, EVM సాధన చేయండి.",
    startLearning: "నేర్చుకోవడం ప్రారంభించండి",
    trySimulator: "సిమ్యులేటర్ ప్రయత్నించండి",
    practiceTitle: "ప్రాక్టీస్ & అడగండి",
    practiceSubtitle: "మీ పరిజ్ఞానాన్ని పరీక్షించండి. మా AI సాథీతో మాట్లాడండి లేదా EVM సిమ్యులేటర్‌ను ప్రయత్నించండి.",
    scene1Title: "ఓటు కోసం నమోదు చేసుకోండి",
    scene1Desc: "మీ వయస్సు 18+ అయితే, ఓటర్ల జాబితాలో మీ పేరు నమోదు చేసుకోవడానికి ECI పోర్టల్‌లో ఫారం 6 నింపండి.",
    scene2Title: "మీ ID తీసుకురండి",
    scene2Desc: "పోలింగ్ రోజున, మీ ఓటర్ ID లేదా ఆధార్ కార్డును తీసుకెళ్లండి. మొబైల్ ఫోన్‌ను ఇంట్లోనే వదిలేయండి!",
    scene3Title: "చెరగని సిరా",
    scene3Desc: "పోలింగ్ అధికారి మీ ID ని తనిఖీ చేసి, మీ ఎడమ చూపుడు వేలిపై ప్రత్యేక సిరాతో గుర్తు పెడతారు.",
    scene4Title: "బటన్ నొక్కండి",
    scene4Desc: "కంపార్ట్‌మెంట్‌లోకి అడుగుపెట్టండి. EVM పై మీ అభ్యర్థి పక్కన ఉన్న నీలిరంగు బటన్‌ను నొక్కండి. మీకు పెద్ద BEEP వినబడుతుంది.",
    scene5Title: "మీ ఎంపికను ధృవీకరించండి",
    scene5Desc: "VVPAT యంత్రాన్ని చూడండి. ఒక స్లిప్ 7 సెకన్ల పాటు మీ ఓటును చూపుతుంది. మీరు భారతదేశ భవిష్యత్తును నిర్ణయించారు!"
  },
  bn: {
    heroTitle1: "প্রতিটি ভোটের একটি ",
    heroTitle2: "কণ্ঠস্বর আছে।",
    heroSubtitle: "ভারতীয় নির্বাচন প্রক্রিয়ার জন্য আপনার সহজলভ্য নির্দেশিকা। কীভাবে ভোট দিতে হয় তা শিখুন এবং EVM অনুশীলন করুন।",
    startLearning: "শেখা শুরু করুন",
    trySimulator: "সিমুলেটর চেষ্টা করুন",
    practiceTitle: "অনুশীলন করুন এবং জিজ্ঞাসা করুন",
    practiceSubtitle: "আপনার জ্ঞান পরীক্ষা করুন। আমাদের এআই সাথীর সাথে কথা বলুন বা ইভিএম সিমুলেটর চেষ্টা করুন।",
    scene1Title: "ভোটের জন্য নিবন্ধন করুন",
    scene1Desc: "আপনার বয়স ১৮+ হলে, ভোটার তালিকায় আপনার নাম তুলতে ECI পোর্টালে ফর্ম ৬ পূরণ করুন।",
    scene2Title: "আপনার আইডি আনুন",
    scene2Desc: "ভোটের দিন, আপনার ভোটার আইডি বা আধার কার্ড নিন। মোবাইল ফোন বাড়িতে রেখে আসুন!",
    scene3Title: "অমোচনীয় কালি",
    scene3Desc: "পোলিং অফিসার আপনার আইডি পরীক্ষা করবেন এবং আপনার বাম তর্জনীতে বিশেষ কালি লাগাবেন।",
    scene4Title: "বোতাম টিপুন",
    scene4Desc: "ভোটকক্ষে প্রবেশ করুন। EVM-এ আপনার প্রার্থীর পাশের নীল বোতামটি টিপুন। আপনি একটি জোরে BEEP শুনতে পাবেন।",
    scene5Title: "আপনার পছন্দ যাচাই করুন",
    scene5Desc: "VVPAT মেশিনের দিকে তাকান। একটি স্লিপ ৭ সেকেন্ডের জন্য আপনার ভোট দেখাবে। আপনি ভারতের ভবিষ্যত গঠন করেছেন!"
  },
  ta: {
    heroTitle1: "ஒவ்வொரு ஓட்டுக்கும் ஒரு ",
    heroTitle2: "குரல் உள்ளது.",
    heroSubtitle: "இந்திய தேர்தல் செயல்முறைக்கான உங்கள் விரிவான வழிகாட்டி. வாக்களிப்பது எப்படி என்று தெரிந்து கொள்ளுங்கள்.",
    startLearning: "கற்றுக்கொள்ளத் தொடங்குங்கள்",
    trySimulator: "சிமுலேட்டரை முயற்சிக்கவும்",
    practiceTitle: "பயிற்சி மற்றும் கேளுங்கள்",
    practiceSubtitle: "உங்கள் அறிவை சோதிக்கவும். எங்களின் AI சாத்தியிடம் பேசுங்கள் அல்லது EVM சிமுலேட்டரை முயற்சிக்கவும்.",
    scene1Title: "வாக்களிக்க பதிவு செய்யுங்கள்",
    scene1Desc: "உங்களுக்கு 18+ வயது என்றால், வாக்காளர் பட்டியலில் உங்கள் பெயரைச் சேர்க்க ECI போர்ட்டலில் படிவம் 6ஐ நிரப்பவும்.",
    scene2Title: "உங்கள் ஐடியைக் கொண்டு வாருங்கள்",
    scene2Desc: "வாக்குப்பதிவு நாளில், உங்கள் வாக்காளர் அடையாள அட்டை அல்லது ஆதார் அட்டையை எடுத்துச் செல்லுங்கள். மொபைல் போனை வீட்டிலேயே விட்டுச் செல்லுங்கள்!",
    scene3Title: "அழியாத மை",
    scene3Desc: "வாக்குப்பதிவு அதிகாரி உங்கள் ஐடியைச் சரிபார்த்து, உங்கள் இடது ஆள்காட்டி விரலில் சிறப்பு மையால் குறிப்பார்.",
    scene4Title: "பொத்தானை அழுத்தவும்",
    scene4Desc: "EVM-ல் உங்கள் வேட்பாளருக்குப் பக்கத்தில் உள்ள நீல நிற பொத்தானை அழுத்தவும். உங்களுக்கு ஒரு பெரிய BEEP ஒலி கேட்கும்.",
    scene5Title: "உங்கள் தேர்வை சரிபார்க்கவும்",
    scene5Desc: "VVPAT இயந்திரத்தைப் பாருங்கள். ஒரு சீட்டு 7 வினாடிகளுக்கு உங்கள் வாக்கைக் காட்டும். நீங்கள் இந்தியாவின் எதிர்காலத்தை வடிவமைத்துவிட்டீர்கள்!"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  // BCP 47 codes for Speech Synthesis
  speechVoiceCode: string; 
}

const speechCodes: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  ta: 'ta-IN'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // We can load from localStorage if we wanted, but default to 'en' for now

  const value = {
    language,
    setLanguage,
    t: dictionaries[language],
    speechVoiceCode: speechCodes[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
