const { initializeFirebase } = require('./firebase');

const connectDB = async () => {
  try {
    const isFirebaseInitialized = initializeFirebase();
    if (isFirebaseInitialized) {
      console.log('Firebase Connected');
      return true;
    } else {
      console.error('Firebase initialization failed');
      return false;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;