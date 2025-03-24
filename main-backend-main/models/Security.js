const mongoose = require('mongoose');
const AutoIncrementID = require('./AutoIncrement.js');

const securitySchema = new mongoose.Schema({
    _id: Number,
    recaptcha: {
        siteKey: String,
        secretKey: String,
        isEnabled: {
            type: Boolean,
            default: false
        },
        minimumScore: {
            type: Number,
            default: 0.5
        }
    },
    deviceTracking: {
        isEnabled: {
            type: Boolean,
            default: false
        },
        trackingFields: [{
            name: String,
            isRequired: Boolean,
            isEnabled: Boolean
        }]
    },
    analytics: {
        googleAnalytics: {
            trackingId: String,
            isEnabled: {
                type: Boolean,
                default: false
            }
        },
        facebookPixel: {
            pixelId: String,
            isEnabled: {
                type: Boolean,
                default: false
            }
        }
    },
    emailSettings: {
        smtp: {
            host: String,
            port: Number,
            secure: Boolean,
            auth: {
                user: String,
                pass: String
            }
        },
        from: {
            name: String,
            email: String
        },
        isEnabled: {
            type: Boolean,
            default: false
        }
    },
    lastUpdatedBy: {
        type: Number,
        ref: 'User'
    }
}, {
    timestamps: true,
    _id: false
});

securitySchema.plugin(AutoIncrementID, 'Security');

module.exports = mongoose.model('Security', securitySchema);