const { db } = require('../config/firebase');

class Customer {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.totalOrders = data.totalOrders || 0;
    this.totalSpent = data.totalSpent || 0;
    this.lastOrderDate = data.lastOrderDate;
    this.status = data.status || 'active';
  }

  // Save customer to Firestore
  async save() {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const customerData = { ...this };
      delete customerData.id; // Remove id from data to be saved
      
      if (this.id) {
        // Update existing customer
        await db.collection('customers').doc(this.id).set(customerData, { merge: true });
      } else {
        // Create new customer
        const docRef = await db.collection('customers').add(customerData);
        this.id = docRef.id;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving customer: ${error.message}`);
    }
  }

  // Static method to find one customer
  static async findOne(query) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      let snapshot;
      
      if (query._id) {
        // Find by ID
        const doc = await db.collection('customers').doc(query._id).get();
        if (!doc.exists) {
          return null;
        }
        const customerData = doc.data();
        const customer = new Customer(customerData);
        customer.id = doc.id;
        return customer;
      } else if (query.email) {
        // Find by email
        snapshot = await db.collection('customers').where('email', '==', query.email).limit(1).get();
        if (snapshot.empty) {
          return null;
        }
        const doc = snapshot.docs[0];
        const customerData = doc.data();
        const customer = new Customer(customerData);
        customer.id = doc.id;
        return customer;
      } else {
        // Handle other query types as needed
        return null;
      }
    } catch (error) {
      throw new Error(`Error finding customer: ${error.message}`);
    }
  }

  // Static method to find customers
  static async find(query = {}) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      let snapshot;
      
      if (Object.keys(query).length === 0) {
        // Find all customers
        snapshot = await db.collection('customers').get();
      } else if (query.email) {
        // Find customers by email
        snapshot = await db.collection('customers').where('email', '==', query.email).get();
      } else {
        // Handle other queries
        // For now, we'll just return all customers
        snapshot = await db.collection('customers').get();
      }
      
      if (snapshot.empty) {
        return [];
      }
      
      const customers = [];
      snapshot.forEach(doc => {
        const customerData = doc.data();
        const customer = new Customer(customerData);
        customer.id = doc.id;
        customers.push(customer);
      });
      
      return customers;
    } catch (error) {
      throw new Error(`Error finding customers: ${error.message}`);
    }
  }

  // Static method to find one customer and update
  static async findOneAndUpdate(query, updateData, options = {}) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const customer = await this.findOne(query);
      if (!customer) {
        return null;
      }
      
      // Apply updates
      Object.keys(updateData).forEach(key => {
        if (key === '$set') {
          // Handle $set operator
          Object.keys(updateData.$set).forEach(setKey => {
            customer[setKey] = updateData.$set[setKey];
          });
        } else {
          customer[key] = updateData[key];
        }
      });
      
      // Save updated customer
      await customer.save();
      
      return options.new !== false ? customer : undefined;
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  // Static method to delete a customer
  static async deleteOne(query) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      if (query._id) {
        await db.collection('customers').doc(query._id).delete();
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }
}

module.exports = Customer;