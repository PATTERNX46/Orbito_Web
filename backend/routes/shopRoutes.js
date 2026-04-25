const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Find nearby shops, or ALL approved shops if GPS coordinates are missing
router.get('/nearby', async (req, res) => {
  const { lat, lng, type } = req.query;

  try {
    // 1. Base Query: Must be Approved
    let query = { status: 'Approved' };

    // 2. Filter by Category (if they clicked 'Tutors', 'Restaurant', etc.)
    // If type is 'All' or undefined, it will skip this and return everything
    if (type && type !== 'All') {
      query.shopType = type;
    }

    // 3. Optional GPS Filtering: Only use $near if lat & lng actually exist!
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000 // Increased to 5km radius to be safe
        }
      };
    }

    // Fetch from database
    const shops = await Shop.find(query);
    res.json(shops);

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
});

// GET a specific provider's listing status
router.get('/my-listing/:userId', async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.params.userId });
    if (!shop) return res.status(404).json({ message: "No listing found" });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listing", error: error.message });
  }
});

// Route for Providers to submit a new shop request
router.post('/register', async (req, res) => {
  // UPDATED: Added gender and experience to the destructured body!
  const { 
    ownerId, name, shopType, description, price, 
    gender, experience, address, phone, lat, lng, isSosEnabled 
  } = req.body;

  try {
    const newShop = await Shop.create({
      owner: ownerId,
      name,
      shopType,
      description, 
      price,       
      gender,      // Saved to DB
      experience,  // Saved to DB
      address,
      phone,
      isSosEnabled: isSosEnabled || false,
      location: {
        type: 'Point',
        // Fallback to Kolkata coordinates if lat/lng are missing so MongoDB doesn't crash
        coordinates: [parseFloat(lng) || 88.3639, parseFloat(lat) || 22.5726] 
      }
    });
    
    res.status(201).json({ message: "Shop request submitted for admin approval!", shop: newShop });
  } catch (error) {
    res.status(400).json({ message: "Failed to register shop", error: error.message });
  }
});

module.exports = router;