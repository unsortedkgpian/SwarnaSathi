// models/Lead.js
const { toString } = require('express-validator/lib/utils');
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId: {
    type: String, 
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
    type: String, 
  },
  quantityOfGold: {
    type: Number,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically set leadId in format YYMMSSmmmmm before saving
leadSchema.pre('save', function (next) {
  if (!this.leadId && this.phone && this.phone.length >= 5) {
    const createdAt = this.createdAt || new Date();
    const YY = String(createdAt.getFullYear()).slice(-2);
    const MM = String(createdAt.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const SS = "SS";
    const mmmmm = this.phone.slice(-5);
    this.leadId = `${YY}${MM}${SS}${mmmmm}`;
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
