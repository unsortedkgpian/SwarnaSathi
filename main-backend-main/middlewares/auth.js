const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const FormSubmission = require('../models/BeOurPartner');
const BlacklistedToken = require('../models/BlacklistedToken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ success: false, message: 'Token is blacklisted' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token belongs to User or FormSubmission
    let user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    } else {
      user = await FormSubmission.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      req.user = user;
    }

    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
