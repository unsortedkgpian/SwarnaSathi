const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
  metaTitle: String,
  metaDescription: String,
  tags: [String],
  canonicalUrl: String,
  slug: {
    type: String,
    unique: true
  },
  reference: {
    model: {
      type: String,
      required: true,
      enum: ['Category', 'Banner', 'Product', 'Investor', 'Team'] // Add other models that will use SEO
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'reference.model'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Seo', seoSchema);