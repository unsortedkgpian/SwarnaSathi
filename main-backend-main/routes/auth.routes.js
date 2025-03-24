const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getMe,
  logout,
  registerForm,
  verifyFormRegistrationOTP,
  loginFormWithPhone,
  verifyFormLoginOTP
} = require('../controllers/authControllers');
const { protect } = require('../middlewares/auth');

// Admin/User Routes (Email/Password)
router.post('/admin/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Form-Based User Routes (Phone/OTP)
router.post('/form/register', registerForm);
router.post('/form/verify-registration-otp', verifyFormRegistrationOTP);
router.post('/form/login/phone', loginFormWithPhone);
router.post('/form/login/verify-otp', verifyFormLoginOTP);


module.exports = router;