const mongoose = require('mongoose');
const Category = require('./Category');

// SEO subdocument remains unchanged
const SEOSchema = new mongoose.Schema({
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' } // Alternatively, you could use [String]
}, { _id: false });

// Main Section: eligibility, application process, and rate details
const MainSectionSchema = new mongoose.Schema({
  eligibility: [{ type: String }],
  applicationProcess: [{ type: String }],
  rateDetails: [{
    title: { type: String },
    details: { type: String }
  }]
}, { _id: false });

// Quicksteps Section:
// - "image" now stores a string (the S3 URL)
// - Each step's "icon" also stores a string.
const QuickstepSchema = new mongoose.Schema({
  icon: { type: String }, // will store the S3 URL for the icon
  title: { type: String },
  content: { type: String }
}, { _id: false });

const QuickstepsSectionSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  image: { type: String }, // S3 URL for the quicksteps section image
  steps: {
    type: [QuickstepSchema],
    validate: {
      validator: function(val) {
        return val.length <= 4;
      },
      message: 'A maximum of 4 steps are allowed.'
    }
  }
}, { _id: false });

// Benefits Section: an array of benefits (each with a title and content)
const BenefitSchema = new mongoose.Schema({
  benefitTitle: { type: String },
  content: { type: String }
}, { _id: false });

const BenefitsSectionSchema = new mongoose.Schema({
  benefits: [BenefitSchema]
}, { _id: false });

// Product schema: core fields plus sections.
// The "icon" field now stores a string (the S3 URL) instead of an ObjectId.
const ProductSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  seo: { type: SEOSchema, default: {} },
  // Sections (to be updated later)
  mainSection: { type: MainSectionSchema, default: {} },
  quickstepsSection: { type: QuickstepsSectionSchema, default: {} },
  benefitsSection: { type: BenefitsSectionSchema, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);