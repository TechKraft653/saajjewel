const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // Make this optional
  },
  name: {
    type: String,
    required: false // Make this optional
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: false // Explicitly make this optional
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make this optional
  },
  customerName: {
    type: String,
    required: false, // Make this optional
    trim: true
  },
  customerEmail: {
    type: String,
    required: false, // Make this optional
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  shippingAddress: {
    type: String,
    required: false // Make this optional
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'razorpay', 'paypal']
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Generate a unique order number: SJ + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000) + 1000;
    this.orderNumber = `SJ-${timestamp}-${random}`;
  }
  next();
});

// Ensure the pre-save hook works for all operations
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    // Generate a unique order number: SJ + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000) + 1000;
    this.orderNumber = `SJ-${timestamp}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;