const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpCreatedAt: {
    type: Date
  },
  googleId: {
    type: String
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  cart: {
    type: [{
      _id: String,
      name: String,
      price: Number,
      originalPrice: Number,
      discountedPrice: Number,
      image: String,
      description: String,
      category: String,
      rating: Number,
      quantity: Number
    }],
    default: []
  },
  addresses: {
    type: [{
      id: String,
      name: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String
    }],
    default: []
  },
  orders: {
    type: [{
      id: String,
      items: [{
        _id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
      }],
      total: Number,
      status: String,
      createdAt: Date,
      shippingAddress: {
        name: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

// Hash password method
userSchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = User;