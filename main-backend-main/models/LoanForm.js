const mongoose = require("mongoose");

const loanFormSchema = new mongoose.Schema(
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
        qualityOfGold: {
            type: Number,
            required: [true, "Quality of gold is required"],
        },
        quantityOfGold: {
            type: Number,
            required: [true, "Quantity of gold is required"],
            min: [0.1, "Quantity must be at least 0.1 grams"],
            validate: {
                validator: function (v) {
                    // Allow up to 2 decimal places
                    return v > 0 && Number.isFinite(v);
                },
                message: "Please enter a valid quantity in grams",
            },
        },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
            validate: {
                validator: function (v) {
                    // Indian pincode format: 6 digits
                    return /^[0-9]{6}$/.test(v);
                },
                message: "Please enter a valid 6-digit pincode",
            },
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            minlength: [10, "Address must be at least 10 characters long"],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("LoanForm", loanFormSchema);