
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;


if (!apiKey) {
  const errorMessage = "Warning: NEXT_PUBLIC_FIREBASE_API_KEY is missing or undefined. " +
    "Firebase will likely fail to initialize if this is not an intentional setup for specific environments. Please ensure that: \n" +
    "1. You have a .env.local file in the root of your project for local development. \n" +
    "2. The .env.local file contains NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_key. \n" +
    "3. You have restarted your Next.js development server after creating/modifying .env.local.\n" +
    "4. All Firebase related environment variables intended for client-side use start with NEXT_PUBLIC_";
  console.warn(errorMessage); 
}

const firebaseConfig = {
  apiKey: apiKey, 
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId 
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app); // Initialize Firestore

export { app, auth, db };
