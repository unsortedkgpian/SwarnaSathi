const Media = require('../models/Media.js');
const upload = require('../utils/FileUpload.js');
const { generateThumbnail, getImageDimensions, isImage, isVideo } = require('../utils/MediaUtils.js');
const path = require('path');

// @desc    Upload media file
// @route   POST /api/media/upload
// @access  Private
exports.uploadMedia = [
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a file'
                });
            }

            const { alt, caption, folder = 'root', isPublic = true } = req.body;
            let type = 'other';
            let dimensions = null;
            let thumbnails = [];

            // Determine file type and process accordingly
            if (isImage(req.file.mimetype)) {
                type = 'image';
                dimensions = await getImageDimensions(req.file.path);

                // Generate thumbnails for images
                const thumbnailSizes = [
                    { name: 'small', width: 150, height: 150 },
                    { name: 'medium', width: 300, height: 300 },
                    { name: 'large', width: 600, height: 600 }
                ];

                for (const size of thumbnailSizes) {
                    const thumbnailPath = await generateThumbnail(
                        req.file.path,
                        size.width,
                        size.height
                    );
                    thumbnails.push({
                        size: size.name,
                        path: thumbnailPath.replace('public', ''),
                        width: size.width,
                        height: size.height
                    });
                }
            } else if (isVideo(req.file.mimetype)) {
                type = 'video';
            }

            const media = await Media.create({
                name: req.file.originalname,
                file: `/uploads/${req.file.filename}`,
                mimeType: req.file.mimetype,
                size: req.file.size,
                type,
                dimensions,
                thumbnails,
                alt,
                caption,
                folder,
                isPublic,
                uploadedBy: req.user._id
            });

            res.status(201).json({
                success: true,
                data: media
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error uploading file',
                error: error.message
            });
        }
    }
];

// @desc    Get all media files
// @route   GET /api/media
// @access  Private
exports.getMedia = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            folder = 'root',
            type,
            search
        } = req.query;

        const query = { folder };

        if (type) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { alt: { $regex: search, $options: 'i' } },
                { caption: { $regex: search, $options: 'i' } }
            ];
        }

        const media = await Media.find(query)
            .populate('uploadedBy', 'name email')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Media.countDocuments(query);

        res.status(200).json({
            success: true,
            data: media,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching media',
            error: error.message
        });
    }
};

// @desc    Update media details
// @route   PUT /api/media/:id
// @access  Private
exports.updateMedia = async (req, res) => {
    try {
        const allowedUpdates = ['name', 'alt', 'caption', 'folder', 'isPublic'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const media = await Media.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }

        res.status(200).json({
            success: true,
            data: media
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating media',
            error: error.message
        });
    }
};

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private
exports.deleteMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }

        // Check if media is in use
        if (media.usage && media.usage.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Media is in use and cannot be deleted'
            });
        }

        // Delete file and thumbnails
        await fs.unlink(`public${media.file}`);
        for (const thumbnail of media.thumbnails) {
            await fs.unlink(`public${thumbnail.path}`);
        }

        await media.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Media deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting media',
            error: error.message
        });
    }
};