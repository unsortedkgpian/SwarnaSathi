const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    personalInfo: {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        currentAddress: {
            type: String,
            required: true,
        },
        permanentAddress: String,
    },
    positionDetails: {
        positionApplied: {
            type: String,
            required: true,
        },
        expectedSalary: Number,
        availableJoiningDate: {
            type: Date,
            required: true,
        },
        preferredLocation: String,
        willingToRelocate: {
            type: Boolean,
            required: true,
        },
    },
    educationalBackground: [
        {
            qualification: String,
            institution: String,
            yearPassing: Number,
            percentage: String,
        },
    ],
    resume: {
        filename: String,     // Original filename
        path: String,        // Path where file is stored
        mimetype: String,    // File type
        size: Number         // File size in bytes
    },
    workExperience: [
        {
            organization: String,
            jobTitle: String,
            duration: {
                from: Date,
                to: Date,
            },
            responsibilities: [String],
            reasonLeaving: String,
        },
    ],
    skills: {
        type: [String],
        required: true,
    },
    references: [
        {
            name: String,
            contact: String,
            relation: String,
        },
    ],
    // declaration: {
    //     signature: {
    //         type: String,
    //         required: true,
    //     },
    //     date: {
    //         type: Date,
    //         required: true,
    //     },
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Application", applicationSchema);
