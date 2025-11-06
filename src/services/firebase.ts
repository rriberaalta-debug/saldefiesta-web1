

// FIX: Use Firebase v8 namespaced imports
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Lee las variables de entorno de forma segura, como configuraste en Netlify.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Valida que las variables de entorno estén presentes (útil para desarrollo local)
if (!firebaseConfig.apiKey) {
    console.error("Firebase config is missing. Make sure to set up your environment variables.");
}

// Inicializa Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporta los servicios que usarás
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Exporta métodos de FieldValue y otros para compatibilidad con v8
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const increment = firebase.firestore.FieldValue.increment;
export const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
export const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;