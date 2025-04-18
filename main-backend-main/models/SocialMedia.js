const mongoose = require("mongoose");

const socialMediaSchema = new mongoose.Schema({
    facebook: {
        type: String,
        required: true,
        trim:true,
        // match: /^[6-9]\d{9}$/, // Validates Indian phone numbers
    },
    twitter: {
        type: String,
        required: true,
        trim: true,
        // match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
    },
    instagram: {
        type: String,
        required: true,
        trim:true,
    },
    linkedin: {
        type: String,
        required: true,
        trim: true,
    }
});

// Method to update contact details
socialMediaSchema.methods.updateSocialMedia = async function (newDetails) {
    Object.assign(this, newDetails);
    await this.save();
};

// Method to format contact info
socialMediaSchema.methods.getSocialMediaInfo = function () {
    return `Facebook: ${this.facebook}, twitter:${this.twitter}, Instagram: ${this.instagram}, Linkedin: ${this.linkedin}`;
};

module.exports = mongoose.model("SocialMedia", socialMediaSchema);
