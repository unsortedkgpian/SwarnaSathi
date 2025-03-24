const mongoose = require('mongoose');

const jobOpeningSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  googleSheetLink: {
    type: String,
    required: true,
    trim: true,
    match: /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+/ // Basic Google Sheets URL validation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobOpening', jobOpeningSchema);