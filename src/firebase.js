// ============================================================
// FIREBASE CONFIG — Veri-Nest
// ============================================================
// HOW TO SET UP (completely FREE):
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a project" → Name it "veri-nest" → Disable Analytics → Create
// 3. Click ⚙️ Project Settings → Scroll to "Your apps" → Click </> (Web)
// 4. Register app name: "veri-nest-web" → Copy the config object below
// 5. Go to Build → Firestore Database → Create Database → Start in TEST mode
// 6. Paste your config values below and restart the app
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY            || "",
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN        || "",
  projectId:         import.meta.env.VITE_FB_PROJECT_ID         || "",
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET     || "",
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_ID       || "",
  appId:             import.meta.env.VITE_FB_APP_ID             || "",
};

// Only initialize if config is present
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app = null;
let db = null;
let auth = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('🔥 Firebase connected → Firestore active');
} else {
  console.log('⚠️ Firebase not configured → Using local mock data');
}

export { db, auth, isConfigured };
export default app;
