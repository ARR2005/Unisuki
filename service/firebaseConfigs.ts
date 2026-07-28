// Import the functions you need from the SDKs you need
import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const expoExtra =
  (Constants as any)?.expoConfig?.extra ??
  (Constants as any)?.manifest?.extra ??
  {};

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    expoExtra.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    expoExtra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
    expoExtra.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    expoExtra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    expoExtra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    expoExtra.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL:
    process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ??
    expoExtra.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = (() => {
  try {
    return initializeAuth(app);
  } catch {
    // Fast Refresh may have already initialized Auth for this Firebase app.
    return getAuth(app);
  }
})();

// Initialize Firestore
const db = getFirestore(app);

// Export named exports for modular usage
export { auth, db };

export default auth;
