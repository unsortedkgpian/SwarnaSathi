// models/InvestorDesk.js
const mongoose = require('mongoose');

// Define a schema for SEO information
const SEOSchema = new mongoose.Schema({
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String }
}, { _id: false }); // _id: false prevents Mongoose from generating an _id for this subdocument

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },  // S3 URL
  filename: { type: String },                   // Original filename
  fileSize: { type: Number },                   // File size in bytes
  createdAt: { type: Date, default: Date.now }
});

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Optional SEO subdocument for each section
  seo: { type: SEOSchema, default: {} },
  documents: [DocumentSchema],
  createdAt: { type: Date, default: Date.now }
});

const InvestorDeskSchema = new mongoose.Schema({
  title: { type: String, default: "Investor’s Desk" },
  sections: [SectionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InvestorDesk', InvestorDeskSchema);