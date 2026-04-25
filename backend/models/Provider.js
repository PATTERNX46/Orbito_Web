const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  serviceCategory: { type: String, required: true }, // e.g., Plumber, Tutor, Electrician
  price: { type: String, required: true }, // e.g., "₹500 per visit", "₹300/hour"
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  experience: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String, required: true },
  
  // The Approval System
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' // Defaults to Pending when they first submit the form
  }
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);