import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Helper to safely get env vars without crashing if import.meta.env is undefined
const getEnv = (key: string, fallback: string) => {
  try {
    // Check if import.meta and import.meta.env exist before accessing
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        // @ts-ignore
        return import.meta.env[key];
    }
  } catch (e) {
    console.warn(`Error reading env var ${key}:`, e);
  }
  return fallback;
};

// Use environment variables with explicit fallbacks
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyBoIURnTep1kFzzH94R0i3Zpoq48le0pI0"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "destiny-crossroads.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "destiny-crossroads"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "destiny-crossroads.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "143051940824"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:143051940824:web:696e9fe3890cb1db04c8ad"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-TE2Q2E20NE")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

export { auth, db, provider };