const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// In production, you would use service account credentials
// For now, we'll initialize with default settings
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp({
        // In production, you would provide service account credentials here
        // For development, Firebase will use default credentials or emulator
      });
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