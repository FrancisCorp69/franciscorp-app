import { initializeApp } from "firebase/app";

import { getReactNativePersistence, initializeAuth } from "firebase/auth";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2I-t5EFXtG_UfRJvqytdwyYkHgP5p2zY",
  authDomain: "franciscorp-app.firebaseapp.com",
  projectId: "franciscorp-app",
  storageBucket: "franciscorp-app.firebasestorage.app",
  messagingSenderId: "476590468336",
  appId: "1:476590468336:android:26124837d7d8c01d1a6635",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;
