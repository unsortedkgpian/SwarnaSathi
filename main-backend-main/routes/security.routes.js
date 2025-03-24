const express = require('express');
const router = express.Router();
const {
    getSecuritySettings,
    updateRecaptcha,
    updateDeviceTracking,
    updateAnalytics,
    updateEmailSettings,
    testEmailSettings,
    getClientConfig
} = require('../controllers/securityController.js');
const { protect, authorize } = require('../middlewares/auth.js');

// Public routes
router.get('/client-config', getClientConfig);

// Protected routes
router.get('/', protect, authorize('admin'), getSecuritySettings);
router.put('/recaptcha', protect, authorize('admin'), updateRecaptcha);
router.put('/device-tracking', protect, authorize('admin'), updateDeviceTracking);
router.put('/analytics', protect, authorize('admin'), updateAnalytics);
router.put('/email', protect, authorize('admin'), updateEmailSettings);
router.post('/email/test', protect, authorize('admin'), testEmailSettings);

module.exports = router;