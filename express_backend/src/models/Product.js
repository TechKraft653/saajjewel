const { db } = require('../config/firebase');

class Product {
  constructor(data) {
    this.name = data.name;
    this.originalPrice = data.originalPrice;
    this.discountedPrice = data.discountedPrice;
    this.image = data.image;
    this.description = data.description;
    this.category = data.category;
    this.rating = data.rating || 4.5;
    this.reviews = data.reviews || 0;
  }

  // Save product to Firestore
  async save() {
    try {
      const productData = { ...this };
      delete productData.id; // Remove id from data to be saved
      
      if (this.id) {
        // Update existing product
        await db.collection('products').doc(this.id).set(productData, { merge: true });
      } else {
        // Create new product
        const docRef = await db.collection('products').add(productData);
        this.id = docRef.id;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving product: ${error.message}`);
    }
  }

  // Static method to find one product
  static async findOne(query) {
    try {
      let snapshot;
      
      if (query._id) {
        // Find by ID
        const doc = await db.collection('products').doc(query._id).get();
        if (!doc.exists) {
          return null;
        }
        const productData = doc.data();
        const product = new Product(productData);
        product.id = doc.id;
        return product;
      } else {
        // Handle other query types as needed
        return null;
      }
    } catch (error) {
      throw new Error(`Error finding product: ${error.message}`);
    }
  }

  // Static method to find products by category
  static async findByCategory(category) {
    try {
      const snapshot = await db.collection('products').where('category', '==', category).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      const products = [];
      snapshot.forEach(doc => {
        const productData = doc.data();
        const product = new Product(productData);
        product.id = doc.id;
        products.push(product);
      });
      
      return products;
    } catch (error) {
      throw new Error(`Error finding products by category: ${error.message}`);
    }
  }

  // Static method to find all products
  static async find(query = {}) {
    try {
      let snapshot;
      
      if (Object.keys(query).length === 0) {
        // Find all products
        snapshot = await db.collection('products').get();
      } else {
        // Handle specific queries
        // For now, we'll just return all products
        snapshot = await db.collection('products').get();
      }
      
      if (snapshot.empty) {
        return [];
      }
      
      const products = [];
      snapshot.forEach(doc => {
        const productData = doc.data();
        const product = new Product(productData);
        product.id = doc.id;
        products.push(product);
      });
      
      return products;
    } catch (error) {
      throw new Error(`Error finding products: ${error.message}`);
    }
  }

  // Static method to find one product and update
  static async findOneAndUpdate(query, updateData, options = {}) {
    try {
      const product = await this.findOne(query);
      if (!product) {
        return null;
      }
      
      // Apply updates
      Object.keys(updateData).forEach(key => {
        if (key === '$set') {
          // Handle $set operator
          Object.keys(updateData.$set).forEach(setKey => {
            product[setKey] = updateData.$set[setKey];
          });
        } else {
          product[key] = updateData[key];
        }
      });
      
      // Save updated product
      await product.save();
      
      return options.new !== false ? product : undefined;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Static method to delete a product
  static async deleteOne(query) {
    try {
      if (query._id) {
        await db.collection('products').doc(query._id).delete();
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }
}

module.exports = Product;