const mongoose = require('mongoose');
const AutoIncrementID = require('./AutoIncrement');

// Helper schema for files (images/videos)
const fileSchema = new mongoose.Schema({
 type: {
   type: String,
   enum: ['url', 'upload'],
   required: true
 },
 url: {
   type: String,
   // Required only if type is url
   validate: {
     validator: function(v) {
       return this.type !== 'url' || (v && v.length > 0);
     },
     message: 'URL is required when type is url'
   }
 },
 file: {
   filename: String,
   mimetype: String,
   size: Number,
   path: String
 },
 alt: String
}, { _id: false });

// Main category schema
const categorySchema = new mongoose.Schema({
 _id: Number,
 title: {
   type: String,
   required: [true, 'Please provide category title'],
   unique: true,
   trim: true,
   maxLength: [100, 'Title cannot be more than 100 characters']
 },
 description: {
   type: String,
   trim: true,
   maxLength: [500, 'Description cannot be more than 500 characters']
 },
 // Main media type
 mediaType: {
   type: String,
   enum: ['image', 'video'],
   required: true
 },
 // Main media (either image or video)
 image: fileSchema,
 video: fileSchema,
 
 // Gallery
 gallery: [{
   _id: Number,
   media: fileSchema,
   title: String,
   order: {
     type: Number,
     default: 0
   }
 }],
 active: {
   type: Boolean,
   default: true
 },
 createdAt: {
   type: Date,
   default: Date.now
 },
 updatedAt: {
   type: Date,
   default: Date.now
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Validate media type consistency
categorySchema.pre('validate', function(next) {
 if (this.mediaType === 'image' && !this.image) {
   next(new Error('Image is required when mediaType is image'));
 }
 if (this.mediaType === 'video' && !this.video) {
   next(new Error('Video is required when mediaType is video'));
 }
 next();
});

// Update timestamps on save
categorySchema.pre('save', function(next) {
 this.updatedAt = Date.now();
 next();
});

// Virtual for getting media URL/path
categorySchema.virtual('mediaUrl').get(function() {
 const media = this.mediaType === 'image' ? this.image : this.video;
 return media.type === 'url' ? media.url : media.file?.path;
});

// Method to get full media details
categorySchema.methods.getMediaDetails = function() {
 const media = this.mediaType === 'image' ? this.image : this.video;
 return {
   type: this.mediaType,
   sourceType: media.type,
   url: media.type === 'url' ? media.url : media.file?.path,
   fileDetails: media.type === 'upload' ? media.file : null,
   alt: media.alt || null
 };
};

// Method to get sorted gallery
categorySchema.methods.getSortedGallery = function() {
 return this.gallery.sort((a, b) => a.order - b.order);
};

// Add gallery item
categorySchema.methods.addToGallery = function(mediaData, title = '') {
 const maxId = Math.max(...this.gallery.map(item => item._id), 0);
 const maxOrder = Math.max(...this.gallery.map(item => item.order), -1);
 
 this.gallery.push({
   _id: maxId + 1,
   media: mediaData,
   title: title,
   order: maxOrder + 1
 });
};

// Remove gallery item
categorySchema.methods.removeFromGallery = function(galleryItemId) {
 this.gallery = this.gallery.filter(item => item._id !== galleryItemId);
};

// Update gallery order
categorySchema.methods.updateGalleryOrder = function(orderedIds) {
 orderedIds.forEach((id, index) => {
   const item = this.gallery.find(g => g._id === id);
   if (item) {
     item.order = index;
   }
 });
};

// Plugin for auto-incrementing IDs
categorySchema.plugin(AutoIncrementID, "Category");

module.exports = mongoose.model('Category', categorySchema);