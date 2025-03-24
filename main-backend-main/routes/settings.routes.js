// routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrUpdateSettings,
  getSettings,
  updateBranding,
  updatePhoneNumber,
  updateEmail,
  updateAddress,
  addPhoneNumber,
  addEmail,
  addAddress,
  deletePhoneNumber,
  sendContact
} = require('../controllers/settingsControllers'); // Note: corrected filename from settingsControllers to settingController
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/auth.js'); // Assuming you have auth middleware

const settingsValidation = [
  body('phoneNumbers').optional().isArray(),
  body('emails').optional().isArray(),
  body('addresses').optional().isArray()
];

// Main settings routes
router
  .route('/')
  .get(getSettings) // Protected for admins
  .post(protect, authorize('admin'), settingsValidation, createOrUpdateSettings);

router
  .route('/contactus')
  .post(sendContact);

// Branding update
router.put('/branding', protect, authorize('admin'), updateBranding);

// Phone number routes
router
  .route('/phone')
  .post(protect, authorize('admin'), addPhoneNumber);

router
  .route('/phone/:phoneId')
  .put(protect, authorize('admin'), updatePhoneNumber)
  .delete(protect, authorize('admin'), deletePhoneNumber);

// Email routes
router
  .route('/email')
  .post(protect, authorize('admin'), addEmail);

router
  .route('/email/:emailId')
  .put(protect, authorize('admin'), updateEmail);

// Address routes
router
  .route('/address')
  .post(protect, authorize('admin'), addAddress);

router
  .route('/address/:addressId')
  .put(protect, authorize('admin'), updateAddress);

module.exports = router;