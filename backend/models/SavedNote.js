const mongoose = require('mongoose');

const savedNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  pdfBase64: { type: String, required: true }, // NEW: Stores the actual PDF file data
}, { timestamps: true });

module.exports = mongoose.model('SavedNote', savedNoteSchema);