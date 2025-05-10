const LoanForm = require("../models/LoanForm");

/**
 * Create a new loan application
 * @route POST /api/loans
 */
exports.createLoanForm = async (req, res) => {
    try {
        console.log("Loan form request received:", req.body);
        const { name, phone, qualityOfGold, quantityOfGold, pincode, address } = req.body;

        // Basic validation
        if (!name || !phone || !qualityOfGold || !quantityOfGold || !pincode || !address) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check for existing loan with same phone
        const existingLoan = await LoanForm.findOne({ phone: phone.trim() });
        if (existingLoan) {
            return res.status(409).json({
                success: false,
                message: "A loan application with this phone number already exists",
            });
        }

        // Create loan application
        const loanData = {
            name: name.trim(),
            phone: phone.trim(),
            qualityOfGold: qualityOfGold,
            quantityOfGold: Number(quantityOfGold),
            pincode: pincode.trim(),
            address: address.trim(),
        };

        const newLoan = new LoanForm(loanData);
        await newLoan.save();

        res.status(201).json({
            success: true,
            data: {
                id: newLoan._id,
                name: newLoan.name,
                phone: newLoan.phone,
                qualityOfGold: newLoan.qualityOfGold,
                quantityOfGold: newLoan.quantityOfGold,
                pincode: newLoan.pincode,
                appliedAt: newLoan.createdAt,
            },
            message: "Loan application submitted successfully",
        });
    } catch (error) {
        console.error("Loan creation error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A loan application with this phone number already exists",
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
            message: "Internal server error during loan application",
        });
    }
};

/**
 * Get all loan applications
 * @route GET /api/loans
 */
exports.getAllLoanForms = async (req, res) => {
    try {
        console.log("GET /api/loans request received");

        // Optional query parameters for filtering
        const { pincode, qualityOfGold } = req.query;
        let filter = {};

        if (pincode) filter.pincode = pincode;
        if (qualityOfGold) filter.qualityOfGold = qualityOfGold;

        // Fetch loans with optional filters, sort by newest first
        const loans = await LoanForm.find(filter)
            .select("-__v")
            .sort({ createdAt: -1 });

        console.log(`Found ${loans.length} loan applications`);
        res.status(200).json({
            success: true,
            count: loans.length,
            data: loans,
        });
    } catch (error) {
        console.error("Get loans error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching loan applications",
        });
    }
};

/**
 * Get a single loan application by ID
 * @route GET /api/loans/:id
 */
exports.getLoanForm = async (req, res) => {
    try {
        const loan = await LoanForm.findById(req.params.id).select("-__v");

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: "Loan application not found",
            });
        }

        res.status(200).json({
            success: true,
            data: loan,
        });
    } catch (error) {
        console.error("Get loan error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid loan application ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Get loan applications by phone number
 * @route GET /api/loans/phone/:phone
 */
exports.getLoanByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const loan = await LoanForm.findOne({ phone: phone.trim() }).select("-__v");

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: "No loan application found with this phone number",
            });
        }

        res.status(200).json({
            success: true,
            data: loan,
        });
    } catch (error) {
        console.error("Get loan by phone error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Update a loan application
 * @route PUT /api/loans/:id
 */
exports.updateLoanForm = async (req, res) => {
    try {
        const { name, phone, qualityOfGold, quantityOfGold, pincode, address } = req.body;

        // Validate at least one field is being updated
        if (!name && !phone && !qualityOfGold && !quantityOfGold && !pincode && !address) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided for update",
            });
        }

        // Prepare update data
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (qualityOfGold !== undefined) updateData.qualityOfGold = qualityOfGold.trim();
        if (quantityOfGold !== undefined) updateData.quantityOfGold = Number(quantityOfGold);
        if (pincode !== undefined) updateData.pincode = pincode.trim();
        if (address !== undefined) updateData.address = address.trim();

        // Update loan
        const updatedLoan = await LoanForm.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-__v");

        if (!updatedLoan) {
            return res.status(404).json({
                success: false,
                message: "Loan application not found",
            });
        }

        res.status(200).json({
            success: true,
            data: updatedLoan,
            message: "Loan application updated successfully",
        });
    } catch (error) {
        console.error("Update loan error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already associated with another loan",
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
                message: "Invalid loan application ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Delete a loan application
 * @route DELETE /api/loans/:id
 */
exports.deleteLoanForm = async (req, res) => {
    try {
        const deletedLoan = await LoanForm.findByIdAndDelete(req.params.id);

        if (!deletedLoan) {
            return res.status(404).json({
                success: false,
                message: "Loan application not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: deletedLoan._id,
                name: deletedLoan.name,
                phone: deletedLoan.phone,
            },
            message: "Loan application deleted successfully",
        });
    } catch (error) {
        console.error("Delete loan error:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid loan application ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during deletion",
        });
    }
};

/**
 * Delete loan application by phone number
 * @route DELETE /api/loans/phone/:phone
 */
exports.deleteLoanByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const deletedLoan = await LoanForm.findOneAndDelete({ phone: phone.trim() });

        if (!deletedLoan) {
            return res.status(404).json({
                success: false,
                message: "No loan application found with this phone number",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: deletedLoan._id,
                name: deletedLoan.name,
                phone: deletedLoan.phone,
            },
            message: "Loan application deleted successfully",
        });
    } catch (error) {
        console.error("Delete loan by phone error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during deletion",
        });
    }
};