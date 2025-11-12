const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // In production, use service account credentials from environment variables
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Parse the service account key from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use service account key file path
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      } else {
        // For development, initialize with default settings
        // This will use default credentials or Firebase Emulator
        admin.initializeApp();
      }
    }
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
};

module.exports = { 
  initializeFirebase,
  db: admin.firestore()
};