import { initializeApp } from "firebase/app";

import { getReactNativePersistence, initializeAuth } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyIWabrvpw1T4pKDhJMF8CuCZmtVhP1Q8",
  authDomain: "franciscorp-app.firebaseapp.com",
  projectId: "franciscorp-app",
  storageBucket: "franciscorp-app.firebasestorage.app",
  messagingSenderId: "476590468336",
  appId: "1:476590468336:web:e844c3ecf61771031a6635",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;
