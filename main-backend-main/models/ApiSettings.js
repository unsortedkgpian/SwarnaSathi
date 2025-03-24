const mongoose = require('mongoose');
const AutoIncrementID = require('./AutoIncrement.js');

const apiSettingsSchema = new mongoose.Schema({
    _id: Number,
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['CIBIL', 'PAYMENT', 'SMS', 'OTHER'],
        default: 'OTHER'
    },
    credentials: {
        token: {
            type: String,
            required: true
        },
        merchantId: String,
        apiKey: String,
        secretKey: String
    },
    urls: {
        baseUrl: {
            type: String,
            required: true
        },
        endpoints: [{
            name: String,
            path: String,
            method: {
                type: String,
                enum: ['GET', 'POST', 'PUT', 'DELETE']
            }
        }]
    },
    isActive: {
        type: Boolean,
        default: false
    },
    lastChecked: Date,
    status: {
        isWorking: {
            type: Boolean,
            default: false
        },
        lastError: String,
        lastSuccessful: Date
    },
    lastUpdatedBy: {
        type: Number,
        ref: 'User'
    }
}, {
    timestamps: true,
    _id: false
});

apiSettingsSchema.plugin(AutoIncrementID, 'ApiSettings');

module.exports = mongoose.model('ApiSettings', apiSettingsSchema);