const mongoose = require('mongoose');

const storeLocationSchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true,
    trim: true
  },
  locationLink: {
    type: String,
    required: true,
    trim: true,
    match: /^https:\/\/(www\.)?google\.com\/maps\/.+$/ // Basic Google Maps URL validation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StoreLocation', storeLocationSchema);