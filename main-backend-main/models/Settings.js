const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // Website Branding
  navbarLogo: {
    type: String,
    trim: true,
    default: ''  // Changed from required: true to optional with default
  },
  favicon: {
    type: String,
    trim: true,
    default: ''  // Changed from required: true to optional with default
  },

  // Contact Information
  phoneNumbers: [{
    number: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['mobile', 'office', 'support'],
      default: 'mobile'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  emails: [{
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    purpose: {
      type: String,
      enum: ['support', 'sales', 'general', 'billing'],
      default: 'general'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  contactEmail: {  // New field
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    required: true // Making it required, adjust if optional is preferred
  },
  // Address Information
  addresses: [{
    title: {  // New field added
      type: String,
      required: true,
      trim: true
    },
    location: {
      addressText: {
        type: String,
        required: true,
        trim: true
      },
      googleMapsLink: {
        type: String,
        trim: true,
        default: null
      }
    },
    contactNumbers: {
      mobile: {
        type: String,
        trim: true,
        default: null
      },
      telephone: {
        type: String,
        trim: true,
        default: null
      },
      office: {
        type: String,
        trim: true,
        default: null
      }
    },
    emails: [{
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      required: true
    }],
    isPrimary: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);