import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let db: any = null;
let auth: any = null;
let isFirebaseEnabled = false;

// Check if configuration is active and not placeholder mock
const isRealConfig = firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "mock-api-key" &&
  !firebaseConfig.apiKey.includes("MY_");

if (isRealConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    auth = getAuth(app);
    isFirebaseEnabled = true;
    console.log("Firebase initialized successfully with real configuration.");
  } catch (error) {
    console.warn("Failed to initialize Firebase with config, falling back to local storage core:", error);
    isFirebaseEnabled = false;
  }
} else {
  console.log("Using Mock/Local-Storage database: Run the Real Firebase Provisioner to connect to cloud.");
}

async function testConnection() {
  if (isFirebaseEnabled && db) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firestore connection test completed successfully.");
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. The client is offline.");
      } else {
        console.warn("Firestore connection check warning:", error);
      }
    }
  }
}
testConnection();

export { app, db, auth, isFirebaseEnabled };
