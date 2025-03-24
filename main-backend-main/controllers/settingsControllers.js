// controllers/settingController.js
const Setting = require('../models/Settings');
const upload = require('../utils/FileUpload');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

exports.getSettings = async (req, res) => {
    try {
      const settings = await Setting.findOne();
      res.status(200).json({
        success: true,
        data: settings || null
      });
    } catch (error) {
      console.error('Error in getSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  // Create or Update Settings
  exports.createOrUpdateSettings = [
    upload.fields([
      { name: 'navbarLogo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 }
    ]),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const settingsData = {
          phoneNumbers: req.body.phoneNumbers ? JSON.parse(req.body.phoneNumbers) : [],
          emails: req.body.emails ? JSON.parse(req.body.emails) : [],
          addresses: req.body.addresses ? JSON.parse(req.body.addresses) : [],
          contactEmail: req.body.contactEmail || ''
        };
  
        if (req.files) {
          if (req.files.navbarLogo) settingsData.navbarLogo = req.files.navbarLogo[0].location;
          if (req.files.favicon) settingsData.favicon = req.files.favicon[0].location;
        }
  
        const existingSettings = await Setting.findOne();
        if (existingSettings) {
          const updatedSettings = await Setting.findOneAndUpdate(
            {},
            { $set: settingsData },
            { new: true, runValidators: true }
          );
          return res.status(200).json({
            success: true,
            data: updatedSettings,
            message: 'Settings updated successfully'
          });
        } else {
          // Removed strict requirement for navbarLogo and favicon
          const newSettings = new Setting({
            navbarLogo: settingsData.navbarLogo || '', // Default to empty string if not provided
            favicon: settingsData.favicon || '',       // Default to empty string if not provided
            phoneNumbers: settingsData.phoneNumbers,
            emails: settingsData.emails,
            addresses: settingsData.addresses,
            contactEmail: settingsData.contactEmail || 'default@yourdomain.com'
          });
          await newSettings.save();
          return res.status(201).json({
            success: true,
            data: newSettings,
            message: 'Settings created successfully'
          });
        }
      } catch (error) {
        console.error('Error in createOrUpdateSettings:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    }
  ];

exports.sendContact = async (req, res) => {
    try {
      const { name, email, phone, purpose, comments } = req.body;
  
      if (!name || !email || !phone || !purpose || !comments) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields: name, email, phone, purpose, and comments'
        });
      }
  
      const settings = await Setting.findOne();
      if (!settings || !settings.contactEmail) {
        return res.status(500).json({
          success: false,
          message: 'Contact email not configured in settings'
        });
      }
  
      const recipientEmail = settings.contactEmail;
      console.log(recipientEmail);
      const emailSubject = `New Contact Form Submission: ${purpose}`;
      const emailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Comments:</strong> ${comments}</p>
      `;
  
      await sendEmail({
        from: process.env.FROM_EMAIL, // Backend config email
        email: recipientEmail,       // To contactEmail from settings
        subject: emailSubject,
        data:{content: emailContent}
      });
  
      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon!'
      });
    } catch (error) {
      console.error('Error in sendContact:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending contact form',
        error: error.message
      });
    }
  };

// Update Branding (navbarLogo and favicon)
exports.updateBranding = [
  upload.fields([
    { name: 'navbarLogo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const settings = await Setting.findOne();
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      const updateData = {};
      if (req.files.navbarLogo) updateData.navbarLogo = req.files.navbarLogo[0].location;
      if (req.files.favicon) updateData.favicon = req.files.favicon[0].location;

      const updatedSettings = await Setting.findOneAndUpdate(
        {},
        { $set: updateData },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: updatedSettings,
        message: 'Branding updated successfully'
      });
    } catch (error) {
      console.error('Error in updateBranding:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

// Update Phone Number
exports.updatePhoneNumber = async (req, res) => {
  try {
    const { phoneId } = req.params;
    const { number, type, isPrimary } = req.body;

    const settings = await Setting.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    const phoneIndex = settings.phoneNumbers.findIndex(
      phone => phone._id.toString() === phoneId
    );
    
    if (phoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    // Update only provided fields
    if (number) settings.phoneNumbers[phoneIndex].number = number;
    if (type) settings.phoneNumbers[phoneIndex].type = type;
    if (typeof isPrimary === 'boolean') settings.phoneNumbers[phoneIndex].isPrimary = isPrimary;

    await settings.save();
    res.status(200).json({
      success: true,
      data: settings,
      message: 'Phone number updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePhoneNumber:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Email
exports.updateEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    const { email, purpose, isPrimary } = req.body;

    const settings = await Setting.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    const emailIndex = settings.emails.findIndex(
      e => e._id.toString() === emailId
    );
    
    if (emailIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    if (email) settings.emails[emailIndex].email = email;
    if (purpose) settings.emails[emailIndex].purpose = purpose;
    if (typeof isPrimary === 'boolean') settings.emails[emailIndex].isPrimary = isPrimary;

    await settings.save();
    res.status(200).json({
      success: true,
      data: settings,
      message: 'Email updated successfully'
    });
  } catch (error) {
    console.error('Error in updateEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { location, contactNumbers, emails, isPrimary } = req.body;

    const settings = await Setting.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    const addressIndex = settings.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (location) {
      if (location.addressText) settings.addresses[addressIndex].location.addressText = location.addressText;
      if (location.googleMapsLink !== undefined) settings.addresses[addressIndex].location.googleMapsLink = location.googleMapsLink;
    }
    if (contactNumbers) {
      if (contactNumbers.mobile !== undefined) settings.addresses[addressIndex].contactNumbers.mobile = contactNumbers.mobile;
      if (contactNumbers.telephone !== undefined) settings.addresses[addressIndex].contactNumbers.telephone = contactNumbers.telephone;
      if (contactNumbers.office !== undefined) settings.addresses[addressIndex].contactNumbers.office = contactNumbers.office;
    }
    if (emails) settings.addresses[addressIndex].emails = emails;
    if (typeof isPrimary === 'boolean') settings.addresses[addressIndex].isPrimary = isPrimary;

    await settings.save();
    res.status(200).json({
      success: true,
      data: settings,
      message: 'Address updated successfully'
    });
  } catch (error) {
    console.error('Error in updateAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Existing add and delete controllers remain the same
exports.addPhoneNumber = async (req, res) => { /* ... */ };
exports.addEmail = async (req, res) => { /* ... */ };
exports.addAddress = async (req, res) => { /* ... */ };
exports.deletePhoneNumber = async (req, res) => { /* ... */ };