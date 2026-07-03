import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let db = null;

try {
  // Only initialize if a valid project ID has been configured
  if (firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase Firestore initialized successfully.");
  } else {
    console.warn("Firebase config missing or using placeholders. Falling back to local storage.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

export { db };
