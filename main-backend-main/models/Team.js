const mongoose = require('mongoose');
// const AutoIncrementID = require('./AutoIncrement');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide team member name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide team member category']
    },
    position: {
        type: String,
        required: [true, 'Please provide team member position']
    },
    image: {
        file: String,
        mimeType: String,
        alt: String
    },
    description: {
        type: String,
        required: [true, 'Please provide description']
    },
    socialMedia: {
        linkedin: String,
        twitter: String,
        facebook: String,
        instagram: String,
        website: String
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});


module.exports = mongoose.model('Team', teamSchema);