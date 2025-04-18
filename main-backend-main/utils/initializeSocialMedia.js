const mongoose = require('mongoose');
const SocialMedia = require('../models/SocialMedia');
const dotenv = require('dotenv');
const connectDB = require('../db/database');

dotenv.config();

const initializeSocialMedia = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if social media data exists
    const existingData = await SocialMedia.findOne();
    
    if (!existingData) {
      console.log('No social media data found. Creating initial data...');
      
      // Create default social media data
      const defaultSocialMedia = new SocialMedia({
        facebook: 'https://www.facebook.com/swarnsathi2022',
        twitter: 'https://twitter.com/Swarnsathi2022',
        linkedin: 'https://www.linkedin.com/company/swarn-sathi',
        instagram: 'https://www.instagram.com/swarn_sathi/'
      });
      
      await defaultSocialMedia.save();
      console.log('Initial social media data created successfully.');
    } else {
      console.log('Social media data already exists:', existingData);
    }
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error initializing social media data:', error);
  }
};

// Run the initialization function if this file is executed directly
if (require.main === module) {
  initializeSocialMedia();
}

module.exports = initializeSocialMedia; 