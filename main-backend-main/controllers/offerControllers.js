const Offer = require('../models/Offer.js');
const upload = require('../utils/FileUpload.js');

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = [
    upload.single('image'),
    async (req, res) => {
        try {
            const { title, description, startDate, endDate } = req.body;

            let offerData = {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                createdBy: req.user._id,
                order: (await Offer.countDocuments()) + 1
            };

            // Handle image upload
            if (req.file) {
                offerData.image = {
                    file: `/uploads/offers/${req.file.filename}`,
                    mimeType: req.file.mimetype,
                    alt: title
                };
            }

            const offer = await Offer.create(offerData);

            res.status(201).json({
                success: true,
                data: offer
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating offer',
                error: error.message
            });
        }
    }
];

// @desc    Get all offers
// @route   GET /api/offers
// @access  Public
exports.getOffers = async (req, res) => {
    try {
        const query = {};

        // Filter active offers
        if (req.query.active === 'true') {
            const now = new Date();
            query.active = true;
            query.startDate = { $lte: now };
            query.endDate = { $gte: now };
        }

        const offers = await Offer.find(query)
            .populate('createdBy', 'name email')
            .sort('order');

        res.status(200).json({
            success: true,
            count: offers.length,
            data: offers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching offers',
            error: error.message
        });
    }
};

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Public
exports.getOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        // Increment views
        offer.views += 1;
        await offer.save();

        res.status(200).json({
            success: true,
            data: offer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching offer',
            error: error.message
        });
    }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
exports.updateOffer = [
    upload.single('image'),
    async (req, res) => {
        try {
            let offer = await Offer.findById(req.params.id);

            if (!offer) {
                return res.status(404).json({
                    success: false,
                    message: 'Offer not found'
                });
            }

            const updateData = { ...req.body };

            // Handle date conversion
            if (updateData.startDate) {
                updateData.startDate = new Date(updateData.startDate);
            }
            if (updateData.endDate) {
                updateData.endDate = new Date(updateData.endDate);
            }

            // Handle image update
            if (req.file) {
                updateData.image = {
                    file: `/uploads/offers/${req.file.filename}`,
                    mimeType: req.file.mimetype,
                    alt: updateData.title || offer.title
                };
            }

            offer = await Offer.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

            res.status(200).json({
                success: true,
                data: offer
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating offer',
                error: error.message
            });
        }
    }
];

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        await offer.deleteOne();

        // Reorder remaining offers
        const remainingOffers = await Offer.find().sort('order');
        for (let i = 0; i < remainingOffers.length; i++) {
            remainingOffers[i].order = i + 1;
            await remainingOffers[i].save();
        }

        res.status(200).json({
            success: true,
            message: 'Offer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting offer',
            error: error.message
        });
    }
};

// @desc    Track offer click
// @route   POST /api/offers/:id/track-click
// @access  Public
exports.trackClick = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        offer.clicks += 1;
        await offer.save();

        res.status(200).json({
            success: true,
            message: 'Click tracked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error tracking click',
            error: error.message
        });
    }
};