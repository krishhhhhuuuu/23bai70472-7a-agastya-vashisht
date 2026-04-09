// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Auth + Google
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Import Firestore
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBa-SshMkcn8jlUJ_Fj9aUQz94YzDnnJl4",
  authDomain: "cloudquizsystem-74f42.firebaseapp.com",
  projectId: "cloudquizsystem-74f42",
  storageBucket: "cloudquizsystem-74f42.firebasestorage.app",
  messagingSenderId: "1056811212048",
  appId: "1:1056811212048:web:1b70877eabfa7204bb9995"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// ✅ EXPORT THESE (IMPORTANT)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();