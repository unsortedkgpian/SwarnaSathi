const mongoose = require('mongoose');
const AutoIncrementID = require('./AutoIncrement');

const newsletterSchema = new mongoose.Schema({
    _id: Number,
    email: {
        type: String,
        required: [true, 'Please provide email address'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please provide a valid email'
        ]
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'unsubscribed'],
        default: 'active'
    },
    subscriptionDate: {
        type: Date,
        default: Date.now
    },
    unsubscribeToken: {
        type: String,
        unique: true
    },
    lastEmailSent: Date,
    offers: [{
        offerId: {
            type: Number,
            ref: 'Offer'
        },
        sentDate: Date,
        opened: {
            type: Boolean,
            default: false
        },
        clicked: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true,
    _id: false
});

newsletterSchema.plugin(AutoIncrementID, 'Newsletter');

module.exports = mongoose.model('Newsletter', newsletterSchema);