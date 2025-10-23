import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// La configuración de tu aplicación web de Firebase.
// Es más seguro usar variables de entorno, pero para empezar, esto funcionará.
const firebaseConfig = {
  apiKey: "AIzaSyBbf8uf0n3E44jb8bBgczIQaMT62UqkbwE",
  authDomain: "saldefiestaweb.firebaseapp.com",
  projectId: "saldefiestaweb",
  storageBucket: "saldefiestaweb.appspot.com",
  messagingSenderId: "718667354849",
  appId: "1:718667354849:web:57ffceef786dd7fb729da0",
  measurementId: "G-8L5Y9KS1K1"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás en el resto de tu aplicación
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
