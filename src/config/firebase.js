// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKLMj6vfTADLLe8Dcong7WsbvDy1Y-MXo",
  authDomain: "hairsalon-e640d.firebaseapp.com",
  projectId: "hairsalon-e640d",
  storageBucket: "hairsalon-e640d.appspot.com",
  messagingSenderId: "402059657444",
  appId: "1:402059657444:web:8ee6aac9b4f450d5faacf1",
  measurementId: "G-THGFLMMBL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { storage, googleProvider };
