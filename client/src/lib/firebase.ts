// Import the functions you need from the SDKs you need
import { initializeApp} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDroqLkHnIl2sCRZ2FAaDkD7jEvGse6bmI",
  authDomain: "hyperwebapp.firebaseapp.com",
  projectId: "hyperwebapp",
  storageBucket: "hyperwebapp.firebasestorage.app",
  messagingSenderId: "231328778492",
  appId: "1:231328778492:web:df25224222c4091e57af79",
  measurementId: "G-L6LTE3B7MG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };