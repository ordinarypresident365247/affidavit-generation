// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { exp } from "firebase/firestore/pipelines";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPcXfPldX3gyWGKz1sQr4b_Pwp6-2nDSo",
  authDomain: "affidavit-generation.firebaseapp.com",
  projectId: "affidavit-generation",
  storageBucket: "affidavit-generation.firebasestorage.app",
  messagingSenderId: "69333902326",
  appId: "1:69333902326:web:2f222003afb95c24905dd7",
  measurementId: "G-EENSM30CWT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);    
const auth = getAuth(app);

export { app, analytics, auth };