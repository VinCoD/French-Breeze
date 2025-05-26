
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
// Add other Firebase services like Firestore here as needed
// import { getFirestore, type Firestore } from "firebase/firestore";

// TEMPORARY DEBUG LOG: Remove after checking the value in your server console/terminal
console.log("Attempting to use Firebase API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
