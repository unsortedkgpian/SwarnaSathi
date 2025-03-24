const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String, // Will store the file path of the image
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  linkedinLink: {
    type: String,
    required: true,
    trim: true,
    match: /^https?:\/\/(www\.)?linkedin\.com\/.*$/ // Basic LinkedIn URL validation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);