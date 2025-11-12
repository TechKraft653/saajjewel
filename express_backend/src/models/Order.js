const { db } = require('../config/firebase');

class Order {
  constructor(data) {
    this.orderNumber = data.orderNumber;
    this.customer = data.customer;
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    this.shippingAddress = data.shippingAddress;
    this.items = data.items || [];
    this.totalAmount = data.totalAmount;
    this.status = data.status || 'pending';
    this.paymentStatus = data.paymentStatus || 'pending';
    this.paymentMethod = data.paymentMethod;
    this.razorpayOrderId = data.razorpayOrderId;
    this.razorpayPaymentId = data.razorpayPaymentId;
  }

  // Generate order number
  generateOrderNumber() {
    if (!this.orderNumber) {
      // Generate a unique order number: SJ + timestamp + random 4 digits
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 9000) + 1000;
      this.orderNumber = `SJ-${timestamp}-${random}`;
    }
  }

  // Save order to Firestore
  async save() {
    try {
      // Generate order number if not exists
      this.generateOrderNumber();
      
      const orderData = { ...this };
      delete orderData.id; // Remove id from data to be saved
      
      if (this.id) {
        // Update existing order
        await db.collection('orders').doc(this.id).set(orderData, { merge: true });
      } else {
        // Create new order
        const docRef = await db.collection('orders').add(orderData);
        this.id = docRef.id;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving order: ${error.message}`);
    }
  }

  // Static method to find one order
  static async findOne(query) {
    try {
      let snapshot;
      
      if (query._id) {
        // Find by ID
        const doc = await db.collection('orders').doc(query._id).get();
        if (!doc.exists) {
          return null;
        }
        const orderData = doc.data();
        const order = new Order(orderData);
        order.id = doc.id;
        return order;
      } else if (query.orderNumber) {
        // Find by order number
        snapshot = await db.collection('orders').where('orderNumber', '==', query.orderNumber).limit(1).get();
        if (snapshot.empty) {
          return null;
        }
        const doc = snapshot.docs[0];
        const orderData = doc.data();
        const order = new Order(orderData);
        order.id = doc.id;
        return order;
      } else {
        // Handle other query types as needed
        return null;
      }
    } catch (error) {
      throw new Error(`Error finding order: ${error.message}`);
    }
  }

  // Static method to find orders
  static async find(query = {}) {
    try {
      let snapshot;
      
      if (Object.keys(query).length === 0) {
        // Find all orders
        snapshot = await db.collection('orders').get();
      } else if (query.customerEmail) {
        // Find orders by customer email
        snapshot = await db.collection('orders').where('customerEmail', '==', query.customerEmail).get();
      } else {
        // Handle other queries
        // For now, we'll just return all orders
        snapshot = await db.collection('orders').get();
      }
      
      if (snapshot.empty) {
        return [];
      }
      
      const orders = [];
      snapshot.forEach(doc => {
        const orderData = doc.data();
        const order = new Order(orderData);
        order.id = doc.id;
        orders.push(order);
      });
      
      return orders;
    } catch (error) {
      throw new Error(`Error finding orders: ${error.message}`);
    }
  }

  // Static method to find one order and update
  static async findOneAndUpdate(query, updateData, options = {}) {
    try {
      const order = await this.findOne(query);
      if (!order) {
        return null;
      }
      
      // Apply updates
      Object.keys(updateData).forEach(key => {
        if (key === '$set') {
          // Handle $set operator
          Object.keys(updateData.$set).forEach(setKey => {
            order[setKey] = updateData.$set[setKey];
          });
        } else {
          order[key] = updateData[key];
        }
      });
      
      // Save updated order
      await order.save();
      
      return options.new !== false ? order : undefined;
    } catch (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
  }

  // Static method to delete an order
  static async deleteOne(query) {
    try {
      if (query._id) {
        await db.collection('orders').doc(query._id).delete();
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    } catch (error) {
      throw new Error(`Error deleting order: ${error.message}`);
    }
  }
}

module.exports = Order;