const ApiSettings = require('../models/ApiSettings.js');
const axios = require('axios');

// @desc    Create API settings
// @route   POST /api/api-settings
// @access  Private/Admin
exports.createApiSettings = async (req, res) => {
    try {
        const {
            name,
            type,
            credentials,
            urls
        } = req.body;

        const existingSettings = await ApiSettings.findOne({ name });
        if (existingSettings) {
            return res.status(400).json({
                success: false,
                message: 'API settings with this name already exists'
            });
        }

        const apiSettings = await ApiSettings.create({
            name,
            type,
            credentials,
            urls,
            lastUpdatedBy: req.user._id
        });

        // Remove sensitive data from response
        const response = apiSettings.toObject();
        response.credentials = {
            merchantId: credentials.merchantId
        };

        res.status(201).json({
            success: true,
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating API settings',
            error: error.message
        });
    }
};

// @desc    Get all API settings
// @route   GET /api/api-settings
// @access  Private/Admin
exports.getApiSettings = async (req, res) => {
    try {
        const apiSettings = await ApiSettings.find()
            .populate('lastUpdatedBy', 'name email')
            .select('-credentials.token -credentials.secretKey -credentials.apiKey');

        res.status(200).json({
            success: true,
            count: apiSettings.length,
            data: apiSettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching API settings',
            error: error.message
        });
    }
};

// @desc    Update API settings
// @route   PUT /api/api-settings/:id
// @access  Private/Admin
exports.updateApiSettings = async (req, res) => {
    try {
        const updateData = { ...req.body, lastUpdatedBy: req.user._id };
        
        const apiSettings = await ApiSettings.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!apiSettings) {
            return res.status(404).json({
                success: false,
                message: 'API settings not found'
            });
        }

        // Remove sensitive data from response
        const response = apiSettings.toObject();
        response.credentials = {
            merchantId: response.credentials.merchantId
        };

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating API settings',
            error: error.message
        });
    }
};

// @desc    Delete API settings
// @route   DELETE /api/api-settings/:id
// @access  Private/Admin
exports.deleteApiSettings = async (req, res) => {
    try {
        const apiSettings = await ApiSettings.findByIdAndDelete(req.params.id);

        if (!apiSettings) {
            return res.status(404).json({
                success: false,
                message: 'API settings not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'API settings deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting API settings',
            error: error.message
        });
    }
};

// @desc    Test API connection
// @route   POST /api/api-settings/:id/test
// @access  Private/Admin
exports.testApiConnection = async (req, res) => {
    try {
        const apiSettings = await ApiSettings.findById(req.params.id);

        if (!apiSettings) {
            return res.status(404).json({
                success: false,
                message: 'API settings not found'
            });
        }

        try {
            // Test connection using axios
            const response = await axios({
                method: 'GET',
                url: `${apiSettings.urls.baseUrl}/test`, // Adjust based on actual API
                headers: {
                    'Authorization': `Bearer ${apiSettings.credentials.token}`,
                    'Merchant-ID': apiSettings.credentials.merchantId
                }
            });

            // Update status
            apiSettings.lastChecked = new Date();
            apiSettings.status.isWorking = true;
            apiSettings.status.lastSuccessful = new Date();
            apiSettings.status.lastError = null;
            await apiSettings.save();

            res.status(200).json({
                success: true,
                message: 'API connection test successful'
            });
        } catch (error) {
            // Update status with error
            apiSettings.lastChecked = new Date();
            apiSettings.status.isWorking = false;
            apiSettings.status.lastError = error.message;
            await apiSettings.save();

            res.status(400).json({
                success: false,
                message: 'API connection test failed',
                error: error.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error testing API connection',
            error: error.message
        });
    }
};
