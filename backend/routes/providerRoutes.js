const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');

// 1. PROVIDER ROUTE: Submit a new registration form
router.post('/register', async (req, res) => {
  try {
    const newProvider = await Provider.create({
      ...req.body,
      status: 'Pending' // Always force it to Pending for security
    });
    res.status(201).json({ message: "Request submitted successfully!", provider: newProvider });
  } catch (error) {
    res.status(500).json({ message: "Error submitting form", error: error.message });
  }
});

// 2. ADMIN ROUTE: Get all 'Pending' requests
router.get('/pending', async (req, res) => {
  try {
    const pendingRequests = await Provider.find({ status: 'Pending' });
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
});

// 3. ADMIN ROUTE: Approve a request
router.put('/approve/:id', async (req, res) => {
  try {
    const approvedProvider = await Provider.findByIdAndUpdate(
      req.params.id, 
      { status: 'Approved' }, 
      { new: true }
    );
    res.json({ message: "Provider Approved!", provider: approvedProvider });
  } catch (error) {
    res.status(500).json({ message: "Error approving provider", error: error.message });
  }
});

module.exports = router;