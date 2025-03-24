const mongoose = require('mongoose');
const AutoIncrementID = require('./AutoIncrement.js');

const gallerySchema = new mongoose.Schema({
  _id: Number,
  title: {
    type: String,
    required: [true, 'Please provide media title'],
    trim: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  // For S3, we store the file URL (string) instead of file data.
  file: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  alt: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

gallerySchema.plugin(AutoIncrementID, 'Gallery');

module.exports = mongoose.model('Gallery', gallerySchema);