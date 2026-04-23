import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-_hDzS7Yh1N2bP1eJGENtTyfe4Ma997E",
  authDomain: "tezsaniye-cf873.firebaseapp.com",
  projectId: "tezsaniye-cf873",
  storageBucket: "tezsaniye-cf873.firebasestorage.app",
  messagingSenderId: "975738038281",
  appId: "1:975738038281:web:e8ed0f01827e51c3c1b0d8"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();