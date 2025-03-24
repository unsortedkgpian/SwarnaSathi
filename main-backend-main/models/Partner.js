const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  img: {
    type: String, // Will store the file path
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Partner', partnerSchema);