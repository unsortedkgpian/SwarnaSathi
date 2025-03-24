const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const AutoIncrementID = require('./AutoIncrement.js');

const bannerSchema = new mongoose.Schema({
  _id: Number,
  title: {
    type: String,
    required: [true, 'Please provide banner title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide banner description'],
    trim: true
  },
  downloadUrl: {
    type: String,
    required: [true, 'Please provide download URL']
  },
  backgroundType: {
    type: String,
    enum: ['image', 'video', 'youtube'],
    required: true
  },
  // For Image/Video background: store as an object
  media: {
    file: {
      type: String,
      required: function() {
        return this.backgroundType !== 'youtube';
      }
    },
    mimeType: {
      type: String
    },
    alt: {
      type: String
    }
  },
  // For YouTube Videos
  youtubeUrl: {
    type: String,
    required: function() {
      return this.backgroundType === 'youtube';
    }
  },
  // SEO (all optional)
  seo: {
    metaTitle: String,
    metaDescription: String,
    tags: [String],
    canonicalUrl: String,
    slug: {
      type: String,
      sparse: false
    }
  },
  priority: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate YouTube embed code
bannerSchema.virtual('youtubeEmbed').get(function() {
  if (this.backgroundType !== 'youtube' || !this.youtubeUrl) return null;
  
  // Extract video ID from URL
  const videoId = extractYouTubeVideoId(this.youtubeUrl);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
});

// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      return videoId || urlObj.pathname.split('/').pop();
    }
  } catch (error) {
    return null;
  }
  return null;
}

bannerSchema.plugin(mongoosePaginate);
bannerSchema.plugin(AutoIncrementID, 'Banner');

module.exports = mongoose.model('Banner', bannerSchema);