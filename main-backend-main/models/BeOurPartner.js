const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const formSubmissionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: 'swarna-sathi'
  },
  name: {
    type: String,
    required: true,
    default: "Swarn Sathi",
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/,
    unique: true
  },
  pincode: {
    type: String,
    default: "000000",
    match: /^\d{6}$/,
    required: function () {
      return this.type !== 'lending-partner';
    }
  },
  email: {
    type: String,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: function () {
      return this.type === 'lending-partner';
    }
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  loanType: {
    type: String,
    default: 'gold-loan'
  },
  role: {
    type: String,
    default: function () {
      return this.type;
    }
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving if it was modified
formSubmissionSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
formSubmissionSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to add token to user's tokens array
formSubmissionSchema.methods.addToken = async function (token) {
  this.tokens = this.tokens || [];
  this.tokens.push({ token });
  await this.save();
};

// Method to remove specific token
formSubmissionSchema.methods.removeToken = async function (token) {
  this.tokens = this.tokens.filter((t) => t.token !== token);
  await this.save();
};

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);