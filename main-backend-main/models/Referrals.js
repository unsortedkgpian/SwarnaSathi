const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
    {
        referralId: {
            type: String,
            required: [true, "Referral ID is required"],
            unique: true,
            uppercase: true,
            trim: true,
            validate: {
                validator: function (v) {
                    // Alphanumeric referral ID (6-10 characters)
                    return /^[A-Z0-9]{6,10}$/.test(v);
                },
                message: "Referral ID must be 6-10 alphanumeric characters",
            },
        },
        refererPhone: {
            type: String,
            required: [true, "Referer phone number is required"],
            trim: true,
            validate: {
                validator: function (v) {
                    // Basic phone validation
                    return /^[0-9]{10,15}$/.test(v);
                },
                message: "Please enter a valid phone number",
            },
        },
        referredUsers: [
            {
                phone: {
                    type: String,
                    required: true,
                    trim: true,
                    validate: {
                        validator: function (v) {
                            return /^[0-9]{10,15}$/.test(v);
                        },
                        message: "Please enter a valid phone number",
                    },
                },
                referredAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        totalReferrals: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Method to add a referred user
referralSchema.methods.addReferredUser = function (phone) {
    // Check if user already exists in referredUsers
    const existingUser = this.referredUsers.find(
        (user) => user.phone === phone
    );
    
    if (existingUser) {
        throw new Error("This user has already been referred");
    }
    
    this.referredUsers.push({ phone });
    this.totalReferrals = this.referredUsers.length;
    return this.save();
};

module.exports = mongoose.model("Referral", referralSchema);