const mongoose = require('mongoose');
const AutoIncrementID = require('./AutoIncrement.js');

const mediaSchema = new mongoose.Schema({
    _id: Number,
    name: {
        type: String,
        required: true,
        trim: true
    },
    file: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    alt: String,
    caption: String,
    type: {
        type: String,
        enum: ['image', 'video', 'document', 'other'],
        required: true
    },
    dimensions: {
        width: Number,
        height: Number
    },
    thumbnails: [{
        size: String, // e.g., 'small', 'medium', 'large'
        path: String,
        width: Number,
        height: Number
    }],
    folder: {
        type: String,
        default: 'root'
    },
    uploadedBy: {
        type: Number,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    usage: [{
        model: String,
        documentId: Number,
        field: String
    }]
}, {
    timestamps: true,
    _id: false
});

mediaSchema.plugin(AutoIncrementID, 'Media');

module.exports = mongoose.model('Media', mediaSchema);