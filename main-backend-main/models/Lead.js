// models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    unique: true,  
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  qualityOfGold: {
    type: Number, 
  },
  quantityOfGold: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically set leadId = phone before saving
leadSchema.pre('save', function (next) {
  if (!this.leadId) {
    this.leadId = this.phone;
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
