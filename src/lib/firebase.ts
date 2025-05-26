
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
// Add other Firebase services like Firestore here as needed
// import { getFirestore, type Firestore } from "firebase/firestore";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// CRITICAL CHECK: Ensure API Key is loaded
if (!apiKey) {
  const errorMessage = "FATAL ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing or undefined. " +
    "Firebase cannot be initialized. Please ensure that: \n" +
    "1. You have a .env.local file in the root of your project. \n" +
    "2. The .env.local file contains NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_key. \n" +
    "3. You have restarted your Next.js development server after creating/modifying .env.local.\n" +
    "4. All Firebase related environment variables in .env.local start with NEXT_PUBLIC_";
  console.error(errorMessage);
  // Throwing an error here will stop further execution and make the problem very clear.
  throw new Error(errorMessage);
}

// DEBUG LOGS: Check your server terminal AND browser console for these values.
console.log("Firebase Config Check - API Key being used:", apiKey ? apiKey.substring(0, 5) + "..." : "UNDEFINED/EMPTY"); // Log only a portion for security if it exists
console.log("Firebase Config Check - Auth Domain:", authDomain || "UNDEFINED/EMPTY");
console.log("Firebase Config Check - Project ID:", projectId || "UNDEFINED/EMPTY");


const firebaseConfig = {
  apiKey: apiKey, // Use the variable checked above
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
// const db: Firestore = getFirestore(app); // Uncomment if you use Firestore

export { app, auth /*, db */ };
