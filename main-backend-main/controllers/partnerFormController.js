const PartnerForm = require("../models/PartnerForm");

/**
 * Create a new partner registration
 * @route POST /api/partners
 */
exports.createPartnerForm = async (req, res) => {
    try {
        console.log("Partner form request received:", req.body);
        const { name, phone, pincode, email, type } = req.body;

        // Basic validation - only check required fields
        if (!name || !phone || !type) {
            return res.status(400).json({
                success: false,
                message: "Name, phone number, and type are required",
            });
        }

        // Check for existing partner with same phone
        const existingPartner = await PartnerForm.findOne({ phone: phone.trim() });
        if (existingPartner) {
            return res.status(409).json({
                success: false,
                message: "A partner with this phone number already exists",
            });
        }

        // Create partner registration
        const partnerData = {
            name: name.trim(),
            phone: phone.trim(),
            type: type.trim().toLowerCase().replace(/ /g, '_'), // Convert to enum format
        };

        // Add optional fields if provided
        if (pincode) partnerData.pincode = pincode.trim();
        if (email) partnerData.email = email.trim();

        const newPartner = new PartnerForm(partnerData);
        await newPartner.save();

        res.status(201).json({
            success: true,
            data: {
                id: newPartner._id,
                name: newPartner.name,
                phone: newPartner.phone,
                type: newPartner.type,
                registeredAt: newPartner.createdAt,
            },
            message: "Partner registration completed successfully",
        });
    } catch (error) {
        console.error("Partner creation error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A partner with this phone number already exists",
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
            message: "Internal server error during partner registration",
        });
    }
};

/**
 * Get all partner registrations
 * @route GET /api/partners
 */
exports.getAllPartnerForms = async (req, res) => {
    try {
        console.log("GET /api/partners request received");

        // Optional query parameters for filtering
        const { type, pincode } = req.query;
        let filter = {};

        if (type) filter.type = type;
        if (pincode) filter.pincode = pincode;

        // Fetch partners with optional filters, sort by newest first
        const partners = await PartnerForm.find(filter)
            .select("-__v")
            .sort({ createdAt: -1 });

        console.log(`Found ${partners.length} partner registrations`);
        res.status(200).json({
            success: true,
            count: partners.length,
            data: partners,
        });
    } catch (error) {
        console.error("Get partners error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching partner registrations",
        });
    }
};

/**
 * Get a single partner registration by ID
 * @route GET /api/partners/:id
 */
exports.getPartnerForm = async (req, res) => {
    try {
        const partner = await PartnerForm.findById(req.params.id).select("-__v");

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner registration not found",
            });
        }

        res.status(200).json({
            success: true,
            data: partner,
        });
    } catch (error) {
        console.error("Get partner error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid partner registration ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Get partner registration by phone number
 * @route GET /api/partners/phone/:phone
 */
exports.getPartnerByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const partner = await PartnerForm.findOne({ phone: phone.trim() }).select("-__v");

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "No partner registration found with this phone number",
            });
        }

        res.status(200).json({
            success: true,
            data: partner,
        });
    } catch (error) {
        console.error("Get partner by phone error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Update a partner registration
 * @route PUT /api/partners/:id
 */
exports.updatePartnerForm = async (req, res) => {
    try {
        const { name, phone, pincode, email, type } = req.body;

        // Validate at least one field is being updated
        if (!name && !phone && !pincode && !email && !type) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided for update",
            });
        }

        // Prepare update data
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (pincode !== undefined) updateData.pincode = pincode.trim();
        if (email !== undefined) updateData.email = email.trim();
        if (type !== undefined) updateData.type = type.trim().toLowerCase().replace(/ /g, '_');

        // Update partner
        const updatedPartner = await PartnerForm.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-__v");

        if (!updatedPartner) {
            return res.status(404).json({
                success: false,
                message: "Partner registration not found",
            });
        }

        res.status(200).json({
            success: true,
            data: updatedPartner,
            message: "Partner registration updated successfully",
        });
    } catch (error) {
        console.error("Update partner error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already associated with another partner",
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

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid partner registration ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Delete a partner registration
 * @route DELETE /api/partners/:id
 */
exports.deletePartnerForm = async (req, res) => {
    try {
        const deletedPartner = await PartnerForm.findByIdAndDelete(req.params.id);

        if (!deletedPartner) {
            return res.status(404).json({
                success: false,
                message: "Partner registration not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: deletedPartner._id,
                name: deletedPartner.name,
                phone: deletedPartner.phone,
                type: deletedPartner.type,
            },
            message: "Partner registration deleted successfully",
        });
    } catch (error) {
        console.error("Delete partner error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid partner registration ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during deletion",
        });
    }
};

/**
 * Delete partner registration by phone number
 * @route DELETE /api/partners/phone/:phone
 */
exports.deletePartnerByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const deletedPartner = await PartnerForm.findOneAndDelete({ phone: phone.trim() });

        if (!deletedPartner) {
            return res.status(404).json({
                success: false,
                message: "No partner registration found with this phone number",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: deletedPartner._id,
                name: deletedPartner.name,
                phone: deletedPartner.phone,
                type: deletedPartner.type,
            },
            message: "Partner registration deleted successfully",
        });
    } catch (error) {
        console.error("Delete partner by phone error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during deletion",
        });
    }
};