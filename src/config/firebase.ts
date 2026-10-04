import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";

/**
 * Firebase Web SDK public configuration.
 * These values are intentionally hardcoded — they are not secrets.
 * Firebase Web config (apiKey, appId, etc.) is public and required by the
 * browser SDK to identify the Firebase project. They are equivalent to
 * what is found in google-services.json and are visible in browser DevTools.
 *
 * See: https://firebase.google.com/docs/projects/api-keys
 * "API keys for Firebase services are not secret"
 *
 * Secret credentials (Cashfree App ID, Secret Key) are managed exclusively
 * via Firebase Secret Manager on the backend and never appear here.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDwND9IfSVyoITZZXrcDU9q3BGBsiKEc1k",
  authDomain: "zenera-trips.firebaseapp.com",
  projectId: "zenera-trips",
  storageBucket: "zenera-trips.firebasestorage.app",
  messagingSenderId: "243946186771",
  appId: "1:243946186771:web:f88f12f467123ad927b7e6",
};

// Functions region used by Zenera Trips backend (us-central1)
export const FUNCTIONS_REGION = "us-central1";

// Initialize Firebase App (prevents duplicate app initialization error)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const functions: Functions = getFunctions(app, FUNCTIONS_REGION);

// Disabled emulator to allow testing with real Cloud Functions
// Uncomment only when running: firebase emulators:start --only functions
// if (import.meta.env.DEV) {
//   connectFunctionsEmulator(functions, "127.0.0.1", 5001);
// }

export { app, auth, db, storage, functions };
