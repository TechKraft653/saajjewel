const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

class User {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.isVerified = data.isVerified || false;
    this.otp = data.otp;
    this.otpCreatedAt = data.otpCreatedAt;
    this.googleId = data.googleId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.profilePicture = data.profilePicture;
    this.cart = data.cart || [];
    this.addresses = data.addresses || [];
    this.orders = data.orders || [];
  }

  // Save user to Firestore
  async save() {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const userData = { ...this };
      delete userData.id; // Remove id from data to be saved
      
      if (this.id) {
        // Update existing user
        await db.collection('users').doc(this.id).set(userData, { merge: true });
      } else {
        // Create new user
        const docRef = await db.collection('users').add(userData);
        this.id = docRef.id;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  // Static method to find one user
  static async findOne(query) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      let snapshot;
      
      if (query.email) {
        snapshot = await db.collection('users').where('email', '==', query.email).limit(1).get();
      } else {
        // Handle other query types as needed
        return null;
      }
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const userData = doc.data();
      const user = new User(userData);
      user.id = doc.id;
      return user;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Static method to find one user and update
  static async findOneAndUpdate(query, updateData, options = {}) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const user = await this.findOne(query);
      if (!user) {
        return null;
      }
      
      // Apply updates
      Object.keys(updateData).forEach(key => {
        if (key === '$set') {
          // Handle $set operator
          Object.keys(updateData.$set).forEach(setKey => {
            user[setKey] = updateData.$set[setKey];
          });
        } else if (key === '$push') {
          // Handle $push operator
          Object.keys(updateData.$push).forEach(pushKey => {
            if (!user[pushKey]) {
              user[pushKey] = [];
            }
            user[pushKey].push(updateData.$push[pushKey]);
          });
        } else {
          user[key] = updateData[key];
        }
      });
      
      // Save updated user
      await user.save();
      
      return options.new !== false ? user : undefined;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Compare password method
  async comparePassword(candidate) {
    return await bcrypt.compare(candidate, this.password);
  }

  // Hash password method
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
}

module.exports = User;