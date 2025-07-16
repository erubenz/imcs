// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzy8HfnUv4PNSl3DNW3wl1aC7FwdgMDwc",
  authDomain: "imcs-20e60.firebaseapp.com",
  projectId: "imcs-20e60",
  storageBucket: "imcs-20e60.appspot.com",
  messagingSenderId: "201844564603",
  appId: "1:201844564603:web:b9bcda834cd8f1edebb8de"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);