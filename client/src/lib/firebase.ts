// Firebase configuration for HyperDiaScan
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDroqLkHnIl2sCRZ2FAaDkD7jEvGse6bmI",
  authDomain: "hyperwebapp.firebaseapp.com",
  projectId: "hyperwebapp",
  storageBucket: "hyperwebapp.firebasestorage.app",
  messagingSenderId: "231328778492",
  appId: "1:231328778492:web:df25224222c4091e57af79",
  measurementId: "G-L6LTE3B7MG",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;