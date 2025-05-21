const mongoose = require("mongoose");

const partnerFormSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            unique: true,
            validate: {
                validator: function (v) {
                    // Basic phone validation (adjust regex as per your requirements)
                    return /^[0-9]{10,15}$/.test(v);
                },
                message: "Please enter a valid phone number",
            },
        },
        pincode: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    // Only validate if pincode is provided
                    if (!v) return true; // Allow empty/undefined
                    // Indian pincode format: 6 digits
                    return /^[0-9]{6}$/.test(v);
                },
                message: "Please enter a valid 6-digit pincode",
            },
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    // Only validate if email is provided
                    if (!v) return true; // Allow empty/undefined
                    // Email validation
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: "Please enter a valid email address",
            },
        },
        type: {
            type: String,
            required: [true, "Partner type is required"],
            enum: {
                values: ["swarnsathi_champion", "business_associate", "lending_partner"],
                message: "Type must be one of: swarnsathi champion, business associate, lending partner",
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("PartnerForm", partnerFormSchema);