import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Check if we're in demo mode
const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY;

let db = null;
let auth = null;
let storage = null;

if (!isDemoMode) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    // Handle network connectivity
    window.addEventListener('online', () => enableNetwork(db));
    window.addEventListener('offline', () => disableNetwork(db));
  } catch (error) {
    console.warn('Firebase initialization failed, running in demo mode:', error);
  }
} else {
  console.warn('Running in demo mode. Firebase disabled.');
}

export { db, auth, storage, isDemoMode };