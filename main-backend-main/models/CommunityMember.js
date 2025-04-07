// // // models/CommunityMember.model.js
// // const mongoose = require("mongoose");

// // const communityMemberSchema = new mongoose.Schema({
// //     name: { type: String, required: true },
// //     phone: { type: String, required: true, unique: true },
// //     pincode: String,
// //     email: String,
// //     roleType: {
// //         type: String,
// //         enum: [
// //             "swarnsathi_champion",
// //             "business_associate",
// //             "lending_affiliate",
// //         ],
// //         required: true,
// //     },
// //     verified: { type: Boolean, default: false },
// //     registrationDate: { type: Date, default: Date.now },
// // });

// // module.exports = mongoose.model("CommunityMember", communityMemberSchema);

// const mongoose = require("mongoose");

// const communityMemberSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, "Name is required"],
//         trim: true,
//         maxlength: [100, "Name cannot exceed 100 characters"],
//     },
//     phone: {
//         type: String,
//         required: [true, "Phone number is required"],
//         unique: true,
//         validate: {
//             validator: function (v) {
//                 return /^\d{10}$/.test(v);
//             },
//             message: (props) => `${props.value} is not a valid phone number!`,
//         },
//     },
//     type: {
//         type: String,
//         required: true,
//         enum: {
//             values: [
//                 "swarnsathi_champion",
//                 "business_associate",
//                 "lending_affiliate",
//             ],
//             message: "Invalid type",
//         },
//     },
//     pincode: {
//         type: String,
//         validate: {
//             validator: function (v) {
//                 return (
//                     this.type === "lending_affiliate" || /^\d{6}$/.test(v)
//                 );
//             },
//             message: "Pincode must be 6 digits for this role type",
//         },
//     },
//     email: {
//         type: String,
//         validate: {
//             validator: function (v) {
//                 return (
//                     this.type !== "lending_affiliate" ||
//                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
//                 );
//             },
//             message: "Valid email is required for lending affiliates",
//         },
//     },
//     verified: {
//         type: Boolean,
//         default: false,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// module.exports = mongoose.model("CommunityMember", communityMemberSchema);

const mongoose = require("mongoose");

const CommunityMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: (props) =>
                `${props.value} is not a valid 10-digit phone number!`,
        },
    },
    type: {
        type: String,
        required: [true, "Role type is required"],
        enum: {
            values: [
                "swarnsathi_champion",
                "business_associate",
                "lending_partner",
                "gold_loan",
            ],
            message: "{VALUE} is not a valid role type",
        },
    },
    pincode: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                // Only validate if a value is provided
                if (!v) return true;
                return /^\d{6}$/.test(v);
            },
            message: (props) =>
                `${props.value} is not a valid 6-digit pincode!`,
        },
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                // Only validate if a value is provided
                if (!v) return true;
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("CommunityMember", CommunityMemberSchema);
