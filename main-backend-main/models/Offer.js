const mongoose = require('mongoose');
const AutoIncrementID = require('./AutoIncrement.js');

const offerSchema = new mongoose.Schema({
    _id: Number,
    title: {
        type: String,
        required: [true, 'Please provide offer title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide offer description']
    },
    image: {
        file: String,
        mimeType: String,
        alt: String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Number,
        ref: 'User'
    }
}, {
    timestamps: true,
    _id: false
});

// Add validation for end date
offerSchema.pre('save', function(next) {
    if (this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});

offerSchema.plugin(AutoIncrementID, 'Offer');

module.exports = mongoose.model('Offer', offerSchema);