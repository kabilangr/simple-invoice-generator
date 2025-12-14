// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration with fallback values for build time
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD-fake-api-key-for-build-purposes-only',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Check if we're in a browser environment and if config is valid
const isConfigValid = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key';

let app: any;
let auth: any;
let db: any;

const isBuild = process.env.NODE_ENV === 'production'; // Next.js build runs in production mode usually

try {
    console.log("Firebase Config API Key:", firebaseConfig.apiKey ? "Present" : "Missing");
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key') {
        throw new Error("Missing API Key");
    }
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.warn("Firebase initialization failed (expected during build without keys):", error);
    
    // Mock objects to prevent build crash
    app = {};
    auth = {
        currentUser: null,
        onAuthStateChanged: (cb: any) => { cb(null); return () => {}; },
        signOut: () => Promise.resolve(),
    };
    db = {
        type: 'firestore',
        app: app,
    };
}

export { app, auth, db };
export default app;

// Export a helper to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
    return process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key';
};
