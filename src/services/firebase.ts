// FIX: Removed reference to vite/client to resolve type definition error.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// The Firebase config is loaded from environment variables using Vite's syntax.
// FIX: Replaced Vite-specific import.meta.env with standard process.env to resolve TS errors.
const firebaseConfig = {
  // FIX: Replaced import.meta.env with process.env to resolve TypeScript error.
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  // FIX: Replaced import.meta.env with process.env to resolve TypeScript error.
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // FIX: Replaced import.meta.env with process.env to resolve TypeScript error.
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // FIX: Replaced import.meta.env with process.env to resolve TypeScript error.
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  // FIX: Replaced import.meta.env with process.env to resolve TypeScript error.
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // FIX: Replaced import.meta.env with process.env to resolve TypeScript error.
  appId: process.env.VITE_FIREBASE_APP_ID,
  // FIX: Replaced import.meta.env with process.env to resolve TypeScript error.
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Valida que las variables de entorno estén presentes
if (!firebaseConfig.apiKey) {
    console.error("Firebase config is missing. Make sure to set up your VITE_ prefixed environment variables in a .env file.");
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);