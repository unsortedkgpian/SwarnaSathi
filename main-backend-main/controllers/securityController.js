const Security = require('../models/Security');
const crypto = require('crypto');

// @desc    Get security settings
// @route   GET /api/security
// @access  Private/Admin
exports.getSecuritySettings = async (req, res) => {
    try {
        let settings = await Security.findOne()
            .populate('lastUpdatedBy', 'name email');

        if (!settings) {
            settings = await Security.create({
                lastUpdatedBy: req.user._id
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching security settings',
            error: error.message
        });
    }
};

// @desc    Update reCAPTCHA settings
// @route   PUT /api/security/recaptcha
// @access  Private/Admin
exports.updateRecaptcha = async (req, res) => {
    try {
        const settings = await Security.findOneAndUpdate(
            {},
            {
                recaptcha: req.body,
                lastUpdatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating reCAPTCHA settings',
            error: error.message
        });
    }
};

// @desc    Update device tracking settings
// @route   PUT /api/security/device-tracking
// @access  Private/Admin
exports.updateDeviceTracking = async (req, res) => {
    try {
        const settings = await Security.findOneAndUpdate(
            {},
            {
                deviceTracking: req.body,
                lastUpdatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating device tracking settings',
            error: error.message
        });
    }
};

// @desc    Update analytics settings
// @route   PUT /api/security/analytics
// @access  Private/Admin
exports.updateAnalytics = async (req, res) => {
    try {
        const settings = await Security.findOneAndUpdate(
            {},
            {
                analytics: req.body,
                lastUpdatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating analytics settings',
            error: error.message
        });
    }
};

// @desc    Update email settings
// @route   PUT /api/security/email
// @access  Private/Admin
exports.updateEmailSettings = async (req, res) => {
    try {
        const settings = await Security.findOneAndUpdate(
            {},
            {
                emailSettings: req.body,
                lastUpdatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        // Remove sensitive data from response
        const response = settings.toObject();
        if (response.emailSettings?.smtp?.auth) {
            response.emailSettings.smtp.auth.pass = undefined;
        }

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating email settings',
            error: error.message
        });
    }
};

// @desc    Test email settings
// @route   POST /api/security/email/test
// @access  Private/Admin
exports.testEmailSettings = async (req, res) => {
    try {
        const { testEmail } = req.body;
        const settings = await Security.findOne();

        if (!settings?.emailSettings?.isEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Email settings are not enabled'
            });
        }

        // Test email configuration
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport(settings.emailSettings.smtp);

        await transporter.sendMail({
            from: `${settings.emailSettings.from.name} <${settings.emailSettings.from.email}>`,
            to: testEmail,
            subject: 'Email Settings Test',
            text: 'This is a test email from your application.'
        });

        res.status(200).json({
            success: true,
            message: 'Test email sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending test email',
            error: error.message
        });
    }
};

// @desc    Get client-side security config
// @route   GET /api/security/client-config
// @access  Public
exports.getClientConfig = async (req, res) => {
    try {
        const settings = await Security.findOne();
        
        // Only return necessary client-side configurations
        const clientConfig = {
            recaptcha: settings?.recaptcha?.isEnabled ? {
                siteKey: settings.recaptcha.siteKey
            } : null,
            deviceTracking: settings?.deviceTracking?.isEnabled ? {
                trackingFields: settings.deviceTracking.trackingFields
            } : null,
            analytics: {
                googleAnalytics: settings?.analytics?.googleAnalytics?.isEnabled ? {
                    trackingId: settings.analytics.googleAnalytics.trackingId
                } : null,
                facebookPixel: settings?.analytics?.facebookPixel?.isEnabled ? {
                    pixelId: settings.analytics.facebookPixel.pixelId
                } : null
            }
        };

        res.status(200).json({
            success: true,
            data: clientConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching client configuration',
            error: error.message
        });
    }
};