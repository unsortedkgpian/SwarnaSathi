const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        // match: /^[6-9]\d{9}$/, // Validates Indian phone numbers
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
    },
    address: {
        type: String,
        required: true,
    },
    telephone: {
        type: String,
        required:true,
    }
});

// Method to update contact details
contactUsSchema.methods.updateContactDetails = async function (newDetails) {
    Object.assign(this, newDetails);
    await this.save();
};

// Method to format contact info
contactUsSchema.methods.getFormattedContactInfo = function () {
    return `Phone: ${this.phone}, Telephone:${this.telephone}, Email: ${this.email}, Address: ${this.address}`;
};

module.exports = mongoose.model("ContactUs", contactUsSchema);
