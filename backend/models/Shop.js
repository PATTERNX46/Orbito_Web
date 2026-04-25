const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  
  // NEW: Added to catch data from the Provider Registration Form
  description: { type: String }, 
  price: { type: String },       

  shopType: { 
    type: String, 
    // UPDATED: Added 'Services' and 'Tutors' to match the frontend selection
    enum: ['Restaurant', 'Medical', 'Grocery', 'Stationery', 'Services', 'Tutors'], 
    required: true 
  },
  
  address: { type: String, required: true },
  phone: { type: String, required: true },
  isSosEnabled: { type: Boolean, default: false }, // Only for Medical Shops
  
  // Admin Approval System
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  }
}, { timestamps: true });

shopSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Shop', shopSchema);