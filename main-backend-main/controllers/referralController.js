const Referral = require("../models/Referrals");

/**
 * Create a new referral code
 * @route POST /api/referrals
 */
exports.createReferral = async (req, res) => {
    try {
        console.log("Referral creation request received:", req.body);
        const { referralId, refererPhone } = req.body;

        // Basic validation
        if (!referralId || !refererPhone) {
            return res.status(400).json({
                success: false,
                message: "Referral ID and referer phone number are required",
            });
        }

        // Check for existing referral ID
        const existingReferral = await Referral.findOne({ 
            referralId: referralId.toUpperCase() 
        });
        if (existingReferral) {
            return res.status(409).json({
                success: false,
                message: "This referral ID already exists",
            });
        }

        // Create referral
        const referralData = {
            referralId: referralId.toUpperCase(),
            refererPhone: refererPhone.trim(),
        };

        const newReferral = new Referral(referralData);
        await newReferral.save();

        res.status(201).json({
            success: true,
            data: {
                id: newReferral._id,
                referralId: newReferral.referralId,
                refererPhone: newReferral.refererPhone,
                totalReferrals: newReferral.totalReferrals,
                isActive: newReferral.isActive,
                createdAt: newReferral.createdAt,
            },
            message: "Referral code created successfully",
        });
    } catch (error) {
        console.error("Referral creation error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This referral ID already exists",
            });
        }

        // Handle validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: `Validation error: ${messages.join(", ")}`,
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during referral creation",
        });
    }
};

/**
 * Get all referrals
 * @route GET /api/referrals
 */
exports.getAllReferrals = async (req, res) => {
    try {
        console.log("GET /api/referrals request received");

        // Optional query parameters for filtering
        const { refererPhone, isActive } = req.query;
        let filter = {};

        if (refererPhone) filter.refererPhone = refererPhone;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        // Fetch referrals with optional filters, sort by newest first
        const referrals = await Referral.find(filter)
            .select("-__v")
            .sort({ createdAt: -1 });

        console.log(`Found ${referrals.length} referrals`);
        res.status(200).json({
            success: true,
            count: referrals.length,
            data: referrals,
        });
    } catch (error) {
        console.error("Get referrals error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching referrals",
        });
    }
};

/**
 * Get a single referral by ID
 * @route GET /api/referrals/:id
 */
exports.getReferral = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id).select("-__v");

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Referral not found",
            });
        }

        res.status(200).json({
            success: true,
            data: referral,
        });
    } catch (error) {
        console.error("Get referral error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid referral ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Get referral by referral code
 * @route GET /api/referrals/code/:referralId
 */
exports.getReferralByCode = async (req, res) => {
    try {
        const { referralId } = req.params;

        if (!referralId) {
            return res.status(400).json({
                success: false,
                message: "Referral code is required",
            });
        }

        const referral = await Referral.findOne({ 
            referralId: referralId.toUpperCase() 
        }).select("-__v");

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Referral code not found",
            });
        }

        res.status(200).json({
            success: true,
            data: referral,
        });
    } catch (error) {
        console.error("Get referral by code error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Get referrals by referer phone
 * @route GET /api/referrals/phone/:phone
 */
exports.getReferralsByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const referrals = await Referral.find({ 
            refererPhone: phone.trim() 
        }).select("-__v").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: referrals.length,
            data: referrals,
        });
    } catch (error) {
        console.error("Get referrals by phone error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Add a referred user to a referral
 * @route POST /api/referrals/:id/referred
 */
exports.addReferredUser = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Referred user phone number is required",
            });
        }

        const referral = await Referral.findById(req.params.id);

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Referral not found",
            });
        }

        if (!referral.isActive) {
            return res.status(400).json({
                success: false,
                message: "This referral code is not active",
            });
        }

        // Add the referred user
        await referral.addReferredUser(phone.trim());

        res.status(200).json({
            success: true,
            data: {
                referralId: referral.referralId,
                totalReferrals: referral.totalReferrals,
                newReferral: {
                    phone: phone.trim(),
                    referredAt: new Date(),
                },
            },
            message: "User added to referral successfully",
        });
    } catch (error) {
        console.error("Add referred user error:", error);

        // Handle specific error from addReferredUser method
        if (error.message === "This user has already been referred") {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }

        // Handle validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: `Validation error: ${messages.join(", ")}`,
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Toggle referral active status
 * @route PATCH /api/referrals/:id/toggle-status
 */
exports.toggleReferralStatus = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id);

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Referral not found",
            });
        }

        referral.isActive = !referral.isActive;
        await referral.save();

        res.status(200).json({
            success: true,
            data: {
                referralId: referral.referralId,
                isActive: referral.isActive,
            },
            message: `Referral ${referral.isActive ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        console.error("Toggle referral status error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid referral ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Delete a referral
 * @route DELETE /api/referrals/:id
 */
exports.deleteReferral = async (req, res) => {
    try {
        const deletedReferral = await Referral.findByIdAndDelete(req.params.id);

        if (!deletedReferral) {
            return res.status(404).json({
                success: false,
                message: "Referral not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                referralId: deletedReferral.referralId,
                refererPhone: deletedReferral.refererPhone,
                totalReferrals: deletedReferral.totalReferrals,
            },
            message: "Referral deleted successfully",
        });
    } catch (error) {
        console.error("Delete referral error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid referral ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during deletion",
        });
    }
};

/**
 * Get referral statistics
 * @route GET /api/referrals/stats
 */
exports.getReferralStats = async (req, res) => {
    try {
        // Get total referrals
        const totalReferrals = await Referral.countDocuments();
        
        // Get active referrals
        const activeReferrals = await Referral.countDocuments({ isActive: true });
        
        // Get total referred users across all referrals
        const result = await Referral.aggregate([
            {
                $group: {
                    _id: null,
                    totalReferredUsers: { $sum: "$totalReferrals" },
                }
            }
        ]);
        
        const totalReferredUsers = result[0]?.totalReferredUsers || 0;
        
        // Get top referrers
        const topReferrers = await Referral.find()
            .sort({ totalReferrals: -1 })
            .limit(10)
            .select("referralId refererPhone totalReferrals");

        res.status(200).json({
            success: true,
            data: {
                totalReferrals,
                activeReferrals,
                totalReferredUsers,
                topReferrers,
            },
        });
    } catch (error) {
        console.error("Get referral stats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while generating stats",
        });
    }
};

/**
 * Add a referred user to a referral using referral code
 * @route POST /api/referrals/code/:referralId/add-user
 */
exports.addReferredUserToCode = async (req, res) => {
    try {
        const { referralId } = req.params;
        const { phone } = req.body;

        // Basic validation
        if (!referralId) {
            return res.status(400).json({
                success: false,
                message: "Referral code is required",
            });
        }

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "User phone number is required",
            });
        }

        // Find referral by code
        const referral = await Referral.findOne({ 
            referralId: referralId.toUpperCase() 
        });

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Invalid referral code",
            });
        }

        // Check if referral is active
        if (!referral.isActive) {
            return res.status(400).json({
                success: false,
                message: "This referral code is no longer active",
            });
        }

        // Check if user has already been referred
        const alreadyReferred = referral.referredUsers.some(
            user => user.phone === phone.trim()
        );

        if (alreadyReferred) {
            return res.status(409).json({
                success: false,
                message: "This user has already been referred with this code",
            });
        }

        // Check if user has been referred by any other code
        const existingReferral = await Referral.findOne({
            "referredUsers.phone": phone.trim()
        });

        if (existingReferral) {
            return res.status(409).json({
                success: false,
                message: "This user has already been referred with another code",
                existingReferralCode: existingReferral.referralId,
            });
        }

        // Add the user to the referral
        referral.referredUsers.push({
            phone: phone.trim(),
            referredAt: new Date(),
        });
        
        // Update total referrals count
        referral.totalReferrals = referral.referredUsers.length;
        
        // Save the updated referral
        await referral.save();

        res.status(200).json({
            success: true,
            data: {
                referralCode: referral.referralId,
                refererPhone: referral.refererPhone,
                newReferral: {
                    phone: phone.trim(),
                    referredAt: new Date(),
                },
                totalReferrals: referral.totalReferrals,
            },
            message: "User successfully added to referral",
        });

    } catch (error) {
        console.error("Add referred user to code error:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: `Validation error: ${messages.join(", ")}`,
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error while adding referred user",
        });
    }
};

/**
 * Validate referral code (check if code exists and is active)
 * @route GET /api/referrals/validate/:referralId
 */
exports.validateReferralCode = async (req, res) => {
    try {
        const { referralId } = req.params;

        if (!referralId) {
            return res.status(400).json({
                success: false,
                message: "Referral code is required",
            });
        }

        const referral = await Referral.findOne({ 
            referralId: referralId.toUpperCase() 
        });

        if (!referral) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: "Invalid referral code",
            });
        }

        if (!referral.isActive) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: "This referral code is no longer active",
            });
        }

        res.status(200).json({
            success: true,
            valid: true,
            data: {
                referralCode: referral.referralId,
                refererPhone: referral.refererPhone,
                totalReferrals: referral.totalReferrals,
                isActive: referral.isActive,
            },
            message: "Referral code is valid and active",
        });

    } catch (error) {
        console.error("Validate referral code error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while validating referral code",
        });
    }
};

/**
 * Check if a phone number has already been referred
 * @route GET /api/referrals/check-referred/:phone
 */
exports.checkIfReferred = async (req, res) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const referral = await Referral.findOne({
            "referredUsers.phone": phone.trim()
        });

        if (!referral) {
            return res.status(200).json({
                success: true,
                isReferred: false,
                message: "This user has not been referred yet",
            });
        }

        // Find the specific referral entry
        const referredEntry = referral.referredUsers.find(
            user => user.phone === phone.trim()
        );

        res.status(200).json({
            success: true,
            isReferred: true,
            data: {
                referralCode: referral.referralId,
                refererPhone: referral.refererPhone,
                referredAt: referredEntry.referredAt,
            },
            message: "This user has already been referred",
        });

    } catch (error) {
        console.error("Check referred error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while checking referred status",
        });
    }
};