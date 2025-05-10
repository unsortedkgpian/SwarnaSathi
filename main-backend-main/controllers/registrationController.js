const CommunityMember = require("../models/CommunityMember");

/**
 * Create a new user registration
 * @route POST /api/registration
 */
exports.createRegistration = async (req, res) => {
    try {
        console.log("Registration request received:", req.body);
        const { name, phone, type, pincode, email } = req.body;

        // Basic validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Role type is required",
            });
        }

        // Check for existing registration
        const existingMember = await CommunityMember.findOne({ phone });
        if (existingMember) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already registered",
            });
        }

        // Prepare data for storage - create a clean object with only defined values
        const memberData = {
            name: name.trim(),
            phone: phone.trim(),
            type: type.trim(),
        };

        // Only add email/pincode if they exist and are relevant to the type
        if (type === "lending_partner" && email) {
            memberData.email = email.trim();
        }

        if (type !== "lending_partner" && pincode) {
            memberData.pincode = pincode.trim();
        }

        // Create new community member
        const newMember = new CommunityMember(memberData);
        await newMember.save();

        res.status(201).json({
            success: true,
            data: {
                id: newMember._id,
                name: newMember.name,
                type: newMember.type,
                registeredAt: newMember.createdAt,
            },
            message: "Registration completed successfully",
        });
    } catch (error) {
        console.error("Registration error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already registered",
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
            message: "Internal server error during registration",
        });
    }
};

/**
 * Get all community member registrations
 * @route GET /api/registration
 */
exports.getAllRegistrations = async (req, res) => {
    try {
        console.log("GET /api/registration request received");

        // Fetch all members, sort by newest first
        const members = await CommunityMember.find()
            .select("-__v")
            .sort({ createdAt: -1 });

        console.log(`Found ${members.length} members`);
        res.status(200).json(members);
    } catch (error) {
        console.error("Get registrations error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching registrations",
        });
    }
};

/**
 * Retrieve registration details by ID
 * @route GET /api/registration/:id
 */
exports.getRegistration = async (req, res) => {
    try {
        const member = await CommunityMember.findById(req.params.id).select(
            "-__v"
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        res.status(200).json(member);
    } catch (error) {
        console.error("Get registration error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid registration ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


/**
 * Delete a community member registration by phone number
 * @route DELETE /api/registration/phone/:phone
 */
exports.deleteRegistrationByPhone = async (req, res) => {
    try {
        console.log("Delete registration request received for phone:", req.params.phone);
        const { phone } = req.params;

        // Basic validation
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        // Find and remove the registration
        const deletedMember = await CommunityMember.findOneAndDelete({ phone: phone.trim() });

        if (!deletedMember) {
            return res.status(404).json({
                success: false,
                message: "Registration not found with this phone number",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: deletedMember._id,
                name: deletedMember.name,
                phone: deletedMember.phone,
                type: deletedMember.type,
            },
            message: "Registration deleted successfully",
        });
    } catch (error) {
        console.error("Delete registration error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error during deletion",
        });
    }
};