const mongoose = require('mongoose');

const hiwSchema = new mongoose.Schema({
  icon: {
    type: String, // Will store the file path of the icon
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HIW', hiwSchema);