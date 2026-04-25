const express = require('express');
const Shop = require('../models/Shop');
const router = express.Router();

// GET all pending shop requests (For Admin Dashboard)
router.get('/pending-shops', async (req, res) => {
  try {
    // In a real app, you would add middleware here to ensure req.user.role === 'Admin'
    const pendingShops = await Shop.find({ status: 'Pending' }).populate('owner', 'name email');
    res.json(pendingShops);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// PUT to approve a shop
router.put('/approve-shop/:shopId', async (req, res) => {
  try {
    const approvedShop = await Shop.findByIdAndUpdate(
  req.params.id, 
  { status: 'Approved' }, 
  { returnDocument: 'after' } // <--- The modern fix!
);
    res.json({ message: "Shop approved and is now live!", shop });
  } catch (error) {
    res.status(500).json({ message: "Error approving shop" });
  }
});

module.exports = router;