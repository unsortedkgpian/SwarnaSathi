const express = require('express');
const router = express.Router();
const beOurPartnerControllers = require('../controllers/beOurPartnerControllers');
const { protect } = require('../middlewares/auth');

// Public routes - no authentication required
router.post('/', beOurPartnerControllers.createFormSubmission);
router.post('/send-otp', beOurPartnerControllers.sendOTP);
router.post('/verify-otp', beOurPartnerControllers.verifyOTP);
router.post('/verify-phone-otp', beOurPartnerControllers.verifyPhoneOTP);
router.post('/login', beOurPartnerControllers.login);
router.post('/set-password', beOurPartnerControllers.setPassword);
router.post('/logout', beOurPartnerControllers.logout);

// Protected routes - authentication required
router.get('/get-me', protect, beOurPartnerControllers.getMe);
router.get('/', protect, beOurPartnerControllers.getAllSubmissions);
router.get('/:id', protect, beOurPartnerControllers.getSubmission);
router.put('/:id', protect, beOurPartnerControllers.updateSubmission);
router.delete('/:id', protect, beOurPartnerControllers.deleteSubmission);

module.exports = router;