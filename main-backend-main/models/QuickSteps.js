const mongoose = require('mongoose');

const quickStepsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    ref: 'Gallery', // Reference to Gallery Schema for image
    required: true,
  },
  steps: [{
    icon: { type: String, ref: 'Gallery', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  }],
});

module.exports = mongoose.model('QuickSteps', quickStepsSchema);