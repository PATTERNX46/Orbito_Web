const express = require('express');
const SavedNote = require('../models/SavedNote');
const router = express.Router();

// Save the PDF to the database
router.post('/save', async (req, res) => {
  const { userId, title, pdfBase64 } = req.body;
  try {
    const newNote = await SavedNote.create({ user: userId, title, pdfBase64 });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Error saving PDF', error: error.message });
  }
});

// Fetch saved PDFs for a user
router.get('/my-notes/:userId', async (req, res) => {
  try {
    const notes = await SavedNote.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
  }
});

module.exports = router;