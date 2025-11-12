const Customer = require('../models/Customer');

// Convert customer data to vector representation
const customerToVector = (customer) => {
  // This is a simplified example - in a real application, you would use an embedding model
  // to convert customer details into vectors
  const vector = new Array(1536).fill(0);
  
  // Simple hash-based approach for demonstration
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  
  // Create a simple vector representation based on customer properties
  const text = `${customer.name || ''} ${customer.email || ''} ${customer.phone || ''} ${customer.address || ''}`.toLowerCase();
  for (let i = 0; i < Math.min(10, text.length); i++) {
    const index = hash(text.substring(i, i + 5)) % 1536;
    vector[index] = (vector[index] || 0) + 1;
  }
  
  return vector;
};

// In-memory customer storage (in production, you might want to use a database)
let customers = {};
let nextCustomerId = 1;

// Remove Pinecone references and replace with MongoDB-based logic
const User = require('../models/user.model');

// Mock customer data since we're removing Pinecone
const mockCustomers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main St, City, State 12345",
    ordersCount: 5,
    totalSpent: 2500.00,
    lastOrderDate: new Date("2025-10-15T10:30:00Z"),
    status: "active"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+0987654321",
    address: "456 Oak Ave, City, State 67890",
    ordersCount: 3,
    totalSpent: 1800.00,
    lastOrderDate: new Date("2025-10-16T14:45:00Z"),
    status: "active"
  }
];

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
};

// Delete a customer
exports.deleteCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};

// Get customer analytics
exports.getCustomerAnalytics = async (req, res) => {
  try {
    // Calculate customer analytics
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const inactiveCustomers = await Customer.countDocuments({ status: 'inactive' });
    
    // Get customer growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const customerGrowth = await Customer.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: { 
          _id: { 
            $dateToString: { format: "%Y-%m", date: "$createdAt" } 
          }, 
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      customerGrowth: customerGrowth.map(item => ({
        month: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ message: 'Error fetching customer analytics', error: error.message });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    const customer = new Customer(customerData);
    const savedCustomer = await customer.save();
    
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update customer
exports.updateCustomerOriginal = async (req, res) => {
  try {
    const { id } = req.params;
    const customerData = req.body;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { ...customerData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    
    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: error.message });
  }
};

// Search customers by name or email (original function)
exports.searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    
    const matchingCustomers = Object.values(customers).filter(customer => 
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json(matchingCustomers);
  } catch (error) {
    console.error("Error searching customers:", error);
    res.status(500).json({ error: error.message });
  }
};

// Search similar customers using vector similarity (original function)
exports.searchSimilarCustomers = async (req, res) => {
  try {
    const { query, topK = 10 } = req.body;
    
    // Convert query to vector
    const queryVector = customerToVector({ 
      name: query, 
      email: query, 
      phone: query,
      address: query
    });
    
    res.json([]);
  } catch (error) {
    console.error("Error searching similar customers:", error);
    res.status(500).json({ error: error.message });
  }
};

// Function to update customer data when an order is placed
exports.updateCustomerFromOrder = async (orderData) => {
  try {
    const { customerName, customerEmail, customerPhone, totalAmount } = orderData;
    
    // Validate required data
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }
    
    // Find existing customer by email or create new one
    let customer = await Customer.findOne({ email: customerEmail });
    
    if (customer) {
      // Update existing customer
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + (totalAmount || 0);
      customer.lastOrderDate = new Date();
      if (customerPhone) customer.phone = customerPhone;
      if (customerName) customer.name = customerName;
      
      await customer.save();
      console.log('Updated existing customer:', customer.email);
    } else {
      // Create new customer
      customer = new Customer({
        name: customerName || '',
        email: customerEmail,
        phone: customerPhone || '',
        totalOrders: 1,
        totalSpent: totalAmount || 0,
        lastOrderDate: new Date(),
        status: 'active'
      });
      
      await customer.save();
      console.log('Created new customer:', customer.email);
    }
    
    return customer;
  } catch (error) {
    console.error('Error updating customer from order:', error);
    throw error;
  }
};