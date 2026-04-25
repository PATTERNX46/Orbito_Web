const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, enum: ['Ghar Ka Khana', 'Restaurant'], required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
}, { timestamps: true });

// Geo-spatial index create karein taaki hum "Near" query chala sakein
foodItemSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodItem', foodItemSchema);