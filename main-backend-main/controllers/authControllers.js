const User = require('../models/UserSchema.js');
const FormSubmission = require('../models/BeOurPartner.js');
const BlacklistedToken = require('../models/BlacklistedToken');
const jwt = require('jsonwebtoken');
const { sendPhoneOTP, verifyPhoneOTP } = require('../helpers/otpHelper');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h'
  });
};

// Register Admin/User (Email/Password)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user' // Default to 'user' unless specified
    });

    const token = generateToken(user._id, user.role);
    await user.addToken(token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Register Form-Based User (Swarna Sathi, etc.)
exports.registerForm = async (req, res) => {
  try {
    const { type, name, phone, pincode, email } = req.body;

    if (!type || !name || !phone) {
      return res.status(400).json({ message: 'Type, name, and phone are required' });
    }
    if (type === 'lending-partner' && !email) {
      return res.status(400).json({ message: 'Email is required for lending partner' });
    }
    if (type !== 'lending-partner' && !pincode) {
      return res.status(400).json({ message: 'Pincode is required for this type' });
    }

    const existingUser = await FormSubmission.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const formSubmission = new FormSubmission({
      type,
      name,
      phone,
      pincode: type !== 'lending-partner' ? pincode : undefined,
      email: type === 'lending-partner' ? email : undefined
    });

    await formSubmission.save();
    await sendPhoneOTP(phone);

    res.status(201).json({ message: 'Registration successful, please verify phone with OTP' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP for Form Registration
exports.verifyFormRegistrationOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const result = await verifyPhoneOTP(phone, otp);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    const user = await FormSubmission.findOne({ phone });
    const token = generateToken(user._id, user.role);

    res.json({ message: 'Registration completed', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Admin/User (Email/Password)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.role);
    await user.addToken(token);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Login Form-Based User (Phone/OTP)
exports.loginFormWithPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    const user = await FormSubmission.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    await sendPhoneOTP(phone);
    res.json({ message: 'OTP sent to your phone' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP for Form Login
exports.verifyFormLoginOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const result = await verifyPhoneOTP(phone, otp);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    const user = await FormSubmission.findOne({ phone });
    const token = generateToken(user._id, user.role);

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout (Works for both User and FormSubmission)
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    await BlacklistedToken.create({ token });

    if (req.user) { // From User model
      await req.user.removeToken(token);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get Current User (Admin/User only)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

