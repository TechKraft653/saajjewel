const { initializeFirebase, db } = require('./firebase');

const connectDB = async () => {
  try {
    const isFirebaseInitialized = initializeFirebase();
    if (isFirebaseInitialized && db) {
      console.log('Firebase Connected');
      return true;
    } else {
      console.error('Firebase initialization failed or database not available');
      return false;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;