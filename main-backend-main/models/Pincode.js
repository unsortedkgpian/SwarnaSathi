const mongoose = require('mongoose');

// Define schema for pincode entries
const pincodeSchema = new mongoose.Schema({
    pincode: {
        type: String,
        unique: true,
        match: /^\d{6}$/,  // Enforce 6-digit pincode format
    },
}, { timestamps: true });

module.exports = mongoose.model('Pincode', pincodeSchema);
