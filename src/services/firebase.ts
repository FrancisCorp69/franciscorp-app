import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDyIWabrvpw1T4pKDhJMF8CuCZmtVhP1Q8",
  authDomain: "franciscorp-app.firebaseapp.com",
  projectId: "franciscorp-app",
  storageBucket: "franciscorp-app.firebasestorage.app",
  messagingSenderId: "476590468336",
  appId: "1:476590468336:web:e844c3ecf61771031a6635",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;