const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    console.log('Attempting to initialize Firebase...');
    
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      console.log('No existing Firebase app found, initializing new one...');
      
      // In production, use service account credentials from environment variables
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.log('Using FIREBASE_SERVICE_ACCOUNT_KEY from environment variables');
        // Parse the service account key from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('Using GOOGLE_APPLICATION_CREDENTIALS from environment variables');
        // Use service account key file path
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      } else {
        console.log('No Firebase credentials found, attempting default initialization...');
        // For development, initialize with default settings
        // This will use default credentials or Firebase Emulator
        admin.initializeApp();
      }
    } else {
      console.log('Firebase app already initialized');
    }
    
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

// Initialize Firebase when this module is loaded
console.log('Loading firebase.js module...');
const isFirebaseInitialized = initializeFirebase();

// Export db only after Firebase is initialized
const db = isFirebaseInitialized ? admin.firestore() : null;

if (!db) {
  console.error('Firestore database instance is null - Firebase may not be properly initialized');
} else {
  console.log('Firestore database instance created successfully');
}

module.exports = { 
  initializeFirebase,
  db
};