const User = require("../models/user.model");

// --- Cart endpoints ---
exports.getCart = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with empty cart
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        cart: [] 
      });
      await user.save();
    }
    
    return res.json(user.cart || []);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
}

exports.updateCart = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with the cart data
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        cart: req.body || [] 
      });
      await user.save();
    } else {
      // Update existing user's cart
      user = await User.findOneAndUpdate(
        { email },
        { cart: req.body || [] },
        { new: true }
      );
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
}

exports.clearCart = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with empty cart
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        cart: [] 
      });
      await user.save();
    } else {
      // Clear existing user's cart
      user = await User.findOneAndUpdate(
        { email },
        { cart: [] },
        { new: true }
      );
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
}

// --- Address endpoints ---
exports.getAddresses = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with empty addresses
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        addresses: [] 
      });
      await user.save();
    }
    
    return res.json(user.addresses || []);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
}

exports.addAddress = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    const addr = { ...req.body, id: Date.now().toString() };
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with the address
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        addresses: [addr] 
      });
      await user.save();
    } else {
      // Add address to existing user
      user = await User.findOneAndUpdate(
        { email },
        { $push: { addresses: addr } },
        { new: true }
      );
    }
    
    return res.json(addr);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding address', error: error.message });
  }
}

exports.updateAddress = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    const addrId = req.params.id;
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with empty addresses
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        addresses: [] 
      });
      await user.save();
      return res.status(200).json({ success: true });
    }
    
    const updatedAddresses = user.addresses.map(a => 
      a.id === addrId ? { ...a, ...req.body } : a
    );
    
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { addresses: updatedAddresses },
      { new: true }
    );
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating address', error: error.message });
  }
}

exports.deleteAddress = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    const addrId = req.params.id;
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with empty addresses
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        addresses: [] 
      });
      await user.save();
      return res.status(200).json({ success: true });
    }
    
    const updatedAddresses = user.addresses.filter(a => a.id !== addrId);
    
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { addresses: updatedAddresses },
      { new: true }
    );
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
}

// --- Order endpoints ---
exports.getOrders = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with empty orders
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        orders: [] 
      });
      await user.save();
    }
    
    return res.json(user.orders || []);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with empty orders
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        orders: [] 
      });
      await user.save();
    }
    
    const order = (user.orders || []).find(o => o.id == req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
}

exports.addOrder = async (req, res) => {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    
    const order = { ...req.body, id: Date.now().toString() };
    
    // Try to find user, create if not exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user with the order
      user = new User({ 
        email, 
        password: await User.hashPassword(Math.random().toString(36).slice(-8)), // Random password
        orders: [order],
        cart: [] // Clear cart after placing order
      });
      await user.save();
    } else {
      // Add order to existing user
      user = await User.findOneAndUpdate(
        { email },
        { 
          $push: { orders: order },
          $set: { cart: [] } // Clear cart after placing order
        },
        { new: true }
      );
    }
    
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding order', error: error.message });
  }
}