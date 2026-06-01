// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_C6pC3I2M8dxkGFYbnpwjDDMQNEjr1lQ",
  authDomain: "affidavit-generation-id.firebaseapp.com",
  projectId: "affidavit-generation-id",
  storageBucket: "affidavit-generation-id.firebasestorage.app",
  messagingSenderId: "145498941165",
  appId: "1:145498941165:web:3008a73bccf76e99d88ee4",
  measurementId: "G-90PL89VDJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);    
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage, firebaseConfig };
