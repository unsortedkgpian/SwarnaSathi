const mongoose = require("mongoose");

const GoldRateSchema = new mongoose.Schema({
    merchant: {
        type: String,
        required: true,
        trim: true,
    },
    apiaccesstoken: {
        type: String,
        required: true,
        trim: true,
    },
    basecurrency: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: String, 
        required: false,
    },
    rate: {
        type: Number,
        required: false,
    }
});

// Optional: Method to update gold rate settings
GoldRateSchema.methods.updateGoldRateSettings = async function (newSettings) {
    Object.assign(this, newSettings);
    return await this.save();
};

// Optional: Method to get formatted info
GoldRateSchema.methods.getSettingsInfo = function () {
    return `Merchant: ${this.merchant}, Currency: ${this.basecurrency}, Refresh: ${this.refreshinterval} hrs, Rate: ${this.rate}`;
};

module.exports = mongoose.model("GoldRate", GoldRateSchema);
