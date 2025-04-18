const FormSubmission = require("../models/BeOurPartner");
const { sendPhoneOTP, verifyPhoneOTP } = require("../helpers/otpHelper");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });
};

// Create a new form submission
exports.createFormSubmission = async (req, res) => {
    try {
        const { type, name, phone, pincode, email, loanType, password } =
            req.body;

        console.log("----");
        console.log(pincode);
        console.log(type);

        // Basic validation
        if (!type || !name || !phone) {
            return res
                .status(400)
                .json({ message: "Type, name, and phone are required" });
        }
        if (type === "lending-partner" && !email) {
            return res
                .status(400)
                .json({ message: "Email is required for lending partner" });
        }
        if (type !== "lending-partner" && !pincode) {
            return res
                .status(400)
                .json({ message: "Pincode is required for this type" });
        }

        if (phone) {
            const check = await FormSubmission.findOne({ phone, pincode, loanType });
            console.log("check ", check);
            if (check) {
                const formSubmission = await FormSubmission.findOneAndUpdate(
                    { phone },
                    { type },
                    { new: true }
                );
                console.log("here...");
                return res.status(200).json({
                    submission: formSubmission,
                    message: "Form submitted, please verify phone with OTP",
                });
            } else {
                const formSubmission = new FormSubmission({
                    type,
                    name,
                    phone,
                    pincode: type !== "lending-partner" ? pincode : undefined,
                    email: type === "lending-partner" ? email : undefined,
                    loanType: loanType || "gold-loan", // Store the loan type if provided
                    password: password, // Store password if provided
                });
                console.log(formSubmission.pincode);

                const savedSubmission = await formSubmission.save();

                // Send OTP after saving

                res.status(201).json({
                    submission: savedSubmission,
                    message: "Form submitted, please verify phone with OTP",
                });
            }
        }
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate phone number
            res.status(400).json({ message: "Phone number already exists" });
        } else {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    }
};

// Send OTP to a phone number
exports.sendOTP = async (req, res) => {
    try {
        const { phone, loanType } = req.body;

        // Validate required fields
        if (!phone) {
            return res
                .status(400)
                .json({ message: "Phone number is required" });
        }

        // Validate phone number format (Indian mobile number)
        if (!/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                message:
                    "Invalid phone number format. Please provide a valid 10-digit Indian mobile number.",
            });
        }

        // Generate OTP directly in the controller
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        try {
            // Always store the OTP in the database first
            await FormSubmission.findOneAndUpdate(
                { phone },
                {
                    otp,
                    otpExpiresAt: expiresAt,
                    loanType: loanType || "gold-loan", // Store loan type if provided
                },
                { upsert: true, new: true }
            );

            // Log for debugging
            console.log(
                `OTP ${otp} generated for ${phone} (Loan type: ${
                    loanType || "gold-loan"
                })`
            );

            // Attempt to send SMS but don't fail if it doesn't work
            try {
                await sendPhoneOTP(phone);
                return res.status(200).json({
                    success: true,
                    message: "OTP sent successfully",
                });
            } catch (smsError) {
                console.error("SMS Sending Error:", smsError.message);

                // Still return success since OTP is stored in DB
                return res.status(200).json({
                    success: true,
                    message:
                        "OTP generated successfully but SMS delivery failed. Check console for OTP.",
                });
            }
        } catch (error) {
            console.error("Error storing OTP:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    } catch (error) {
        console.error("Send OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Verify OTP for a submission
exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res
                .status(400)
                .json({ message: "Phone and OTP are required" });
        }
        console.log("Verifying OTP:", { phone, otp });
        const result = await verifyPhoneOTP(phone, otp);
        // const result = true;
        if (result.success) {
            const user = await FormSubmission.findOneAndUpdate(
                { phone },
                { otpVerified: true, isVerified: true },
                { new: true }
            );

            // Generate a token
            const token = generateToken(user._id, user.role);

            // Store the token with the user
            if (user.addToken) {
                await user.addToken(token);
            }

            res.json({
                success: true,
                message: result.message,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                },
            });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res
                .status(400)
                .json({ message: "Phone and OTP are required" });
        }
        console.log("Verifying OTP:", { phone, otp });
        const result = await verifyPhoneOTP(phone, otp);
        // const result = true;
        if (result.success) {
            return res
                .status(200)
                .json({ success: true, message: result.message });
        } else {
            return res
                .status(400)
                .json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login with password
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validate inputs
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both phone and password",
            });
        }

        // Find user by phone number
        const user = await FormSubmission.findOne({ phone }).select(
            "+password"
        );
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password",
            });
        }

        // Check if user has a password set
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message:
                    "Account not set up with password. Please use OTP login.",
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password",
            });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        // Store token with user
        await user.addToken(token);

        // Update user verification status
        user.isVerified = true;
        await user.save();

        // Send response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Set or update password
exports.setPassword = async (req, res) => {
    try {
        const { phone, password, currentPassword } = req.body;

        if (!phone || !password) {
            return res
                .status(400)
                .json({ message: "Phone and password are required" });
        }

        // Find user
        const user = await FormSubmission.findOne({ phone }).select(
            "+password"
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If user already has password, verify current password
        if (user.password && !currentPassword) {
            return res.status(400).json({
                message: "Current password is required to update password",
            });
        }

        if (user.password && currentPassword) {
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "Current password is incorrect" });
            }
        }

        // Update password
        user.password = password;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await FormSubmission.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.removeToken(token);

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, message: "Not authenticated" });
        }

        const user = await FormSubmission.findById(req.user._id);

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                type: user.type,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all submissions
exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await FormSubmission.find();
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single submission
exports.getSubmission = async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update submission
exports.updateSubmission = async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        const { type, name, phone, pincode, email } = req.body;
        const updateData = {
            type: type || submission.type,
            name: name || submission.name,
            phone: phone || submission.phone,
            pincode:
                submission.type !== "lending-partner"
                    ? pincode || submission.pincode
                    : undefined,
            email:
                submission.type === "lending-partner"
                    ? email || submission.email
                    : undefined,
        };

        const updatedSubmission = await FormSubmission.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete submission
exports.deleteSubmission = async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        await FormSubmission.findByIdAndDelete(req.params.id);
        res.json({ message: "Submission deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's loan applications
exports.getMyApplications = async (req, res) => {
    try {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, message: "Not authenticated" });
        }

        // Find all submissions with the user's phone number
        const applications = await FormSubmission.find({ 
            phone: req.user.phone 
        }).sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};
