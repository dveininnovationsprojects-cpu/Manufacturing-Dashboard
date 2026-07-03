import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALI5b2AlwAkQ1Uzh6k2yHVL-7HE7TBCXw",
  authDomain: "manufacturing-dashboard-3365a.firebaseapp.com",
  projectId: "manufacturing-dashboard-3365a",
  storageBucket: "manufacturing-dashboard-3365a.firebasestorage.app",
  messagingSenderId: "974650953683",
  appId: "1:974650953683:web:6c64fe9fd6722c5d956926",
  measurementId: "G-8QCLS5NM1M"
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
