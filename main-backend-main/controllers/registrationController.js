// // // // // // // // // controllers/RegistrationController.js
// // // // // // // // const CommunityMember = require("../models/CommunityMember");
// // // // // // // // // const redis = require("../config/redis");
// // // // // // // // const { validatePhone, validateEmail } = require("../utils/validators");

// // // // // // // // exports.createRegistration = async (req, res) => {
// // // // // // // //     try {
// // // // // // // //         const { name, phone, roleType, pincode, email } = req.body;

// // // // // // // //         // Validate required fields
// // // // // // // //         if (!name || !phone || !roleType) {
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "Name, phone, and role type are required fields",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Validate phone format
// // // // // // // //         if (!validatePhone(phone)) {
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "Invalid phone number format (10 digits required)",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Check Redis for OTP verification
// // // // // // // //         const otpKey = `otp:${phone}`;
// // // // // // // //         // const otpData = await redis.hgetall(otpKey);

// // // // // // // //         if (!otpData || otpData.verified !== "true") {
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message:
// // // // // // // //                     "Phone number not verified. Please complete OTP verification first",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Check for existing registration
// // // // // // // //         const existingMember = await CommunityMember.findOne({ phone });
// // // // // // // //         if (existingMember) {
// // // // // // // //             return res.status(409).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "This phone number is already registered",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Validate role type
// // // // // // // //         const validRoles = [
// // // // // // // //             "swarnsathi_champion",
// // // // // // // //             "business_associate",
// // // // // // // //             "lending_affiliate",
// // // // // // // //         ];
// // // // // // // //         if (!validRoles.includes(roleType)) {
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "Invalid role type specified",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Validate email if required
// // // // // // // //         if (roleType === "lending_affiliate" && !email) {
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "Email is required for lending affiliates",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         if (email && !validateEmail(email)) {
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "Invalid email address format",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Validate pincode if required
// // // // // // // //         if (
// // // // // // // //             roleType !== "lending_affiliate" &&
// // // // // // // //             (!pincode || pincode.length !== 6)
// // // // // // // //         ) {
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "Valid 6-digit pincode is required",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Create new community member
// // // // // // // //         const newMember = new CommunityMember({
// // // // // // // //             name,
// // // // // // // //             phone,
// // // // // // // //             roleType,
// // // // // // // //             pincode: roleType !== "lending_affiliate" ? pincode : undefined,
// // // // // // // //             email: roleType === "lending_affiliate" ? email : undefined,
// // // // // // // //             verified: true,
// // // // // // // //         });

// // // // // // // //         await newMember.save();

// // // // // // // //         // Clear OTP data from Redis after successful registration
// // // // // // // //         // await redis.del(otpKey);

// // // // // // // //         res.status(201).json({
// // // // // // // //             success: true,
// // // // // // // //             data: {
// // // // // // // //                 id: newMember._id,
// // // // // // // //                 name: newMember.name,
// // // // // // // //                 roleType: newMember.roleType,
// // // // // // // //                 registeredAt: newMember.createdAt,
// // // // // // // //             },
// // // // // // // //             message: "Registration completed successfully",
// // // // // // // //         });
// // // // // // // //     } catch (error) {
// // // // // // // //         console.error("Registration error:", error);

// // // // // // // //         // Handle duplicate key error
// // // // // // // //         if (error.code === 11000) {
// // // // // // // //             return res.status(409).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "This phone number is already registered",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         // Handle validation errors
// // // // // // // //         if (error.name === "ValidationError") {
// // // // // // // //             const messages = Object.values(error.errors).map(
// // // // // // // //                 (err) => err.message
// // // // // // // //             );
// // // // // // // //             return res.status(400).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: `Validation error: ${messages.join(", ")}`,
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         res.status(500).json({
// // // // // // // //             success: false,
// // // // // // // //             message: "Internal server error during registration",
// // // // // // // //         });
// // // // // // // //     }
// // // // // // // // };

// // // // // // // // // Optional: Get registration details
// // // // // // // // exports.getRegistration = async (req, res) => {
// // // // // // // //     try {
// // // // // // // //         const member = await CommunityMember.findById(req.params.id).select(
// // // // // // // //             "-__v"
// // // // // // // //         );

// // // // // // // //         if (!member) {
// // // // // // // //             return res.status(404).json({
// // // // // // // //                 success: false,
// // // // // // // //                 message: "Registration not found",
// // // // // // // //             });
// // // // // // // //         }

// // // // // // // //         res.status(200).json({
// // // // // // // //             success: true,
// // // // // // // //             data: member,
// // // // // // // //         });
// // // // // // // //     } catch (error) {
// // // // // // // //         console.error("Get registration error:", error);
// // // // // // // //         res.status(500).json({
// // // // // // // //             success: false,
// // // // // // // //             message: "Internal server error",
// // // // // // // //         });
// // // // // // // //     }
// // // // // // // // };

// const CommunityMember = require("../models/CommunityMember");

// /**
//  * Create a new user registration
//  * @route POST /api/registration
//  */
// exports.createRegistration = async (req, res) => {
//     try {
//         const { name, phone, type, pincode, email } = req.body;

//         // Basic validation
//         if (!name || !phone || !type) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Name, phone, and role type are required fields",
//             });
//         }

//         // Validate phone format
//         if (!/^\d{10}$/.test(phone)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid phone number format (10 digits required)",
//             });
//         }

//         // Validate role type
//         const validRoles = [
//             "swarnsathi_champion",
//             "business_associate",
//             "lending_partner",
//         ];
//         if (!validRoles.includes(type)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid role type specified",
//             });
//         }

//         // Role-specific validation
//         if (type === "lending_partner") {
//             // For lending partner, validate email
//             if (!email) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Email is required for lending partners",
//                 });
//             }

//             if (!/^\S+@\S+\.\S+$/.test(email)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid email address format",
//                 });
//             }
//         } else {
//             // For other roles, validate pincode
//             if (!pincode) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Pincode is required for this role type",
//                 });
//             }

//             if (!/^\d{6}$/.test(pincode)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid pincode format (6 digits required)",
//                 });
//             }
//         }

//         // Check for existing registration
//         const existingMember = await CommunityMember.findOne({ phone });
//         if (existingMember) {
//             return res.status(409).json({
//                 success: false,
//                 message: "This phone number is already registered",
//             });
//         }

//         // Prepare data for storage
//         const memberData = {
//             name,
//             phone,
//             type,
//         };

//         // Add role-specific fields
//         if (type === "lending_partner") {
//             memberData.email = email;
//         } else {
//             memberData.pincode = pincode;
//         }

//         // Create new community member
//         const newMember = new CommunityMember(memberData);
//         await newMember.save();

//         res.status(201).json({
//             success: true,
//             data: {
//                 id: newMember._id,
//                 name: newMember.name,
//                 type: newMember.type,
//                 registeredAt: newMember.createdAt,
//             },
//             message: "Registration completed successfully",
//         });
//     } catch (error) {
//         console.error("Registration error:", error);

//         // Handle duplicate key error
//         if (error.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: "This phone number is already registered",
//             });
//         }

//         // Handle validation errors
//         if (error.name === "ValidationError") {
//             const messages = Object.values(error.errors).map(
//                 (err) => err.message
//             );
//             return res.status(400).json({
//                 success: false,
//                 message: `Validation error: ${messages.join(", ")}`,
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: "Internal server error during registration",
//         });
//     }
// };

// /**
//  * Get all community member registrations
//  * @route GET /api/registration
//  */
// exports.getAllRegistrations = async (req, res) => {
//     try {
//         // Fetch all members, sort by newest first
//         const members = await CommunityMember.find()
//             .select("-__v")
//             .sort({ createdAt: -1 });

//         res.status(200).json(members);
//     } catch (error) {
//         console.error("Get registrations error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error while fetching registrations",
//         });
//     }
// };

// /**
//  * Retrieve registration details by ID
//  * @route GET /api/registration/:id
//  */
// exports.getRegistration = async (req, res) => {
//     try {
//         const member = await CommunityMember.findById(req.params.id).select(
//             "-__v"
//         );

//         if (!member) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Registration not found",
//             });
//         }

//         res.status(200).json(member);
//     } catch (error) {
//         console.error("Get registration error:", error);

//         // Handle invalid ObjectId format
//         if (error.name === "CastError" && error.kind === "ObjectId") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid registration ID format",
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

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
