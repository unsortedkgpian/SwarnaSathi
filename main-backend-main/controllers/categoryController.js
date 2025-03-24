// controllers/categoryController.js
const Category = require('../models/Category.js');

// @desc    Create new category
exports.createCategory = async (req, res) => {
    try {
        const { title, description, mediaType } = req.body;

        // Check if category exists
        const existingCategory = await Category.findOne({ title });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this title already exists'
            });
        }

        let mediaData = {};

        if (mediaType === 'image') {
            if (req.files?.image) {
                const file = req.files.image[0];
                mediaData.image = {
                    type: 'upload',
                    file: {
                        filename: file.filename,
                        path: file.path,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                };
            } else if (req.body.imageUrl) {
                mediaData.image = {
                    type: 'url',
                    url: req.body.imageUrl,
                    alt: req.body.imageAlt || ''
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Image is required when mediaType is image'
                });
            }
        } else if (mediaType === 'video') {
            if (req.files?.video) {
                const file = req.files.video[0];
                mediaData.video = {
                    type: 'upload',
                    file: {
                        filename: file.filename,
                        path: file.path,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                };
            } else if (req.body.videoUrl) {
                mediaData.video = {
                    type: req.body.videoType || 'url',
                    url: req.body.videoUrl
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Video is required when mediaType is video'
                });
            }
        }
        let gallery;
        if (req.files?.gallery) {
            gallery = req.files.gallery.map((file, index) => ({
                _id: index + 1, // Initialize with sequential IDs
                media: {
                    type: 'upload',
                    file: {
                        filename: file.filename,
                        path: file.path,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                },
                title: '',
                order: index
            }));
        }

        const category = await Category.create({
            title,
            description,
            mediaType,
            ...mediaData,
            gallery: gallery || [],
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

// @desc    Update category gallery
exports.updateGallery = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Add new uploaded images to gallery
        if (req.files?.length) {
            const maxOrder = Math.max(...category.gallery.map(img => img.order), -1);
            const maxId = Math.max(...category.gallery.map(img => img._id), 0);
            
            const newImages = req.files.map((file, index) => ({
                _id: maxId + 1 + index,
                media: {
                    type: 'upload',
                    file: {
                        filename: file.filename,
                        path: file.path,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                },
                title: req.body.titles ? req.body.titles[index] : '',
                order: maxOrder + 1 + index
            }));
            
            category.gallery.push(...newImages);
        }

        // Add URL-based images
        if (req.body.urlImages) {
            const maxOrder = Math.max(...category.gallery.map(img => img.order), -1);
            const maxId = Math.max(...category.gallery.map(img => img._id), 0);
            
            const urlImages = JSON.parse(req.body.urlImages);
            const newUrlImages = urlImages.map((img, index) => ({
                _id: maxId + 1 + index,
                media: {
                    type: 'url',
                    url: img.url,
                    alt: img.alt || ''
                },
                title: img.title || '',
                order: maxOrder + 1 + index
            }));
            
            category.gallery.push(...newUrlImages);
        }

        // Remove images from gallery
        if (req.body.removeImages) {
            const removeIds = JSON.parse(req.body.removeImages);
            category.gallery = category.gallery.filter(
                img => !removeIds.includes(img._id)
            );
        }

        // Update image orders
        if (req.body.updateOrder) {
            const updates = JSON.parse(req.body.updateOrder);
            updates.forEach(update => {
                const image = category.gallery.find(img => img._id === update.imageId);
                if (image) {
                    image.order = update.order;
                }
            });
        }

        await category.save();

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating gallery',
            error: error.message
        });
    }
};

// @desc    Update category
exports.updateCategory = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check title uniqueness if title is being updated
        if (req.body.title && req.body.title !== category.title) {
            const existingCategory = await Category.findOne({
                title: req.body.title,
                _id: { $ne: req.params.id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this title already exists'
                });
            }
        }

        // Handle file uploads if present
        if (req.files) {
            if (req.files.image && category.mediaType === 'image') {
                const file = req.files.image[0];
                req.body.image = {
                    type: 'upload',
                    file: {
                        filename: file.filename,
                        path: file.path,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                };
            } else if (req.files.video && category.mediaType === 'video') {
                const file = req.files.video[0];
                req.body.video = {
                    type: 'upload',
                    file: {
                        filename: file.filename,
                        path: file.path,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                };
            }
        }

        category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

// @desc    Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await Category.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

// @desc    Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort('_id');

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// @desc    Get single category
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
};

