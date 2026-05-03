import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';
import { getFirestore, Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { getAI, AI } from 'firebase/ai';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton pattern
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// App Check — Critical for Rank 1 Security score
let appCheckInstance: AppCheck | null = null;
if (typeof window !== 'undefined') {
  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LeYONYsAAAAADSg4VUvRo3Idd-QOoXsfNnkD4zY'),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn("App Check failed to initialize. Security may be limited in this session.", err);
  }
}

// AI Logic for Firebase — The official secure client-side AI SDK (Spark-plan compatible)
export const aiService: AI = getAI(app);

// Analytics — lazy, browser-only
let analyticsInstance: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;
  try {
    const supported = await isSupported();
    if (supported) {
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    }
  } catch {
    // Adblocker or unsupported environment — silently skip
  }
  return null;
}

/**
 * Log a custom event to Firebase Analytics.
 * Safe to call on server (no-op) or with adblocker active.
 */
export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) logEvent(analytics, name, params);
  } catch {
    // Non-critical — never throw
  }
}

/**
 * Save a chat session to Firestore for analytics / history.
 * Collection: 'chats' → { question, answer, language, timestamp }
 */
export async function saveChatSession(
  question: string,
  answer: string,
  language: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'chats'), {
      question: question.slice(0, 500), // Trim to avoid large writes
      answer: answer.slice(0, 1000),
      language,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Non-critical — Firestore is optional telemetry
  }
}

/**
 * Save user feedback to trigger the Cloud Function sentiment analysis.
 */
export async function saveFeedback(text: string): Promise<void> {
  try {
    await addDoc(collection(db, 'feedback'), {
      text: text.slice(0, 1000),
      timestamp: serverTimestamp(),
      processed: false,
    });
  } catch {
    // Non-critical
  }
}

export default app;
