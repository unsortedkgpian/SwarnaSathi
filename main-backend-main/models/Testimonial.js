const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    text: {
        type: String,
        required: true,
    },
    img: {
        type: String, // Will store the file path
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
