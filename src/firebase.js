// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, update } from "firebase/database";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFJNfS4AmtnpQB9t65-ct9jLpZCBX-o9I",
  authDomain: "mini-crossword-51d8b.firebaseapp.com",
  projectId: "mini-crossword-51d8b",
  storageBucket: "mini-crossword-51d8b.firebasestorage.app",
  messagingSenderId: "228661784668",
  appId: "1:228661784668:web:7107dcee54b01d66b7b699"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, ref, set, update, auth, onAuthStateChanged, signInWithEmailAndPassword };