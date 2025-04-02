// const mongoose = require('mongoose');

// const storeLocationSchema = new mongoose.Schema({
//   locationName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   locationLink: {
//     type: String,
//     required: true,
//     trim: true,
//     match: /^https:\/\/(www\.)?google\.com\/maps\/.+$/ // Basic Google Maps URL validation
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('StoreLocation', storeLocationSchema);

const mongoose = require("mongoose");

const storeLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("StoreLocation", storeLocationSchema);
