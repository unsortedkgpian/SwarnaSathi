const Banner = require('../models/Banner');
const Gallery = require('../models/Gallery');
const upload = require('../utils/FileUpload');

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = [
    upload.single('media'),
    async (req, res) => {
      console.log(req.body);
      try {
        const {
          title,
          description,
          downloadUrl,
          backgroundType,
          youtubeUrl,
          active,
          seo,
          priority,
        } = req.body;
  
        let bannerData = {
          title,
          description,
          downloadUrl,
          backgroundType,
          seo: JSON.parse(seo || '{}'),
          priority: priority || 0,
          active
        };
  
        // Handle background media
        if (backgroundType === 'youtube') {
          if (!youtubeUrl) {
            return res.status(400).json({
              success: false,
              message: 'YouTube URL is required for YouTube background type'
            });
          }
          bannerData.youtubeUrl = youtubeUrl;
        } else if (req.file) {
          // Create gallery entry for the uploaded media stored in S3.
          // req.file.location contains the S3 URL.
          bannerData.media = {
            file: req.file.location, // S3 URL
            mimeType: req.file.mimetype,
            alt: title,
          };
        } else {
          return res.status(400).json({
            success: false,
            message: 'Media file is required for image/video background type'
          });
        }
  
        const banner = await Banner.create(bannerData);
  
        // Populate media details (if your Banner model uses populate for 'media')
        await banner.populate('media');
  
        res.status(201).json({
          success: true,
          data: banner
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error creating banner',
          error: error.message
        });
      }
    }
  ];
  
// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find()
            .populate('media')
            .sort('priority');

        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching banners',
            error: error.message
        });
    }
};
// @desc    Get single banner
// @route   GET /api/admin/banners/:id
// @access  Private/Admin
exports.getBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id)
            .populate('media');

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            data: banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching banner',
            error: error.message
        });
    }
};
// @desc    Get active banners
// @route   GET /api/banners/active
// @access  Public
exports.getActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ active: { $eq: true } })
            .populate('media')
            .sort('priority');

        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active banners',
            error: error.message
        });
    }
};

// @desc    Update banner priority
// @route   PUT /api/banners/priority
// @access  Private/Admin
exports.updatePriority = async (req, res) => {
    try {
        const { priorities } = req.body; // [{id: '...', priority: 1}, ...]

        if (!Array.isArray(priorities)) {
            return res.status(400).json({
                success: false,
                message: 'Priorities must be an array'
            });
        }

        for (const item of priorities) {
            await Banner.findByIdAndUpdate(item.id, { priority: item.priority });
        }

        const updatedBanners = await Banner.find()
            .populate('media')
            .sort('priority');

        res.status(200).json({
            success: true,
            data: updatedBanners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating priorities',
            error: error.message
        });
    }
};

// @desc    Get all banners with pagination for admin
// @route   GET /api/admin/banners
// @access  Private/Admin
exports.getAdminBanners = async (req, res) => {
    try {
        const { page = 1, limit = 10, active } = req.query;
        const query = active !== undefined ? { active: active === 'true' } : {};

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { priority: 1 },
            populate: 'media'
        };

        const banners = await Banner.paginate(query, options);

        res.status(200).json({
            success: true,
            data: banners.docs,
            pagination: {
                total: banners.totalDocs,
                page: banners.page,
                pages: banners.totalPages
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching banners',
            error: error.message
        });
    }
};


// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = [
  // Use multer-s3 middleware to process the media file
  upload.single('media'),
  async (req, res) => {
    try {
      // Find the existing banner by id
      let banner = await Banner.findById(req.params.id);

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }

      // Copy the request body fields to updateData
      const updateData = { ...req.body };

      // If SEO is provided as a JSON string, parse it into an object
      if (req.body.seo) {
        updateData.seo = JSON.parse(req.body.seo);
      }

      // Update the background type and related fields
      if (req.body.backgroundType) {
        updateData.backgroundType = req.body.backgroundType;

        if (req.body.backgroundType === 'youtube') {
          // For YouTube backgrounds, require a YouTube URL
          if (req.body.youtubeUrl) {
            updateData.youtubeUrl = req.body.youtubeUrl;
            // Clear any previously stored media if switching to YouTube
            updateData.media = undefined;
          } else {
            return res.status(400).json({
              success: false,
              message: 'YouTube URL is required for YouTube background type'
            });
          }
        } else {
          // For image or video backgrounds, if a new file is uploaded, update the media field
          if (req.file) {
            updateData.media = {
              file: req.file.location, // S3 URL of the uploaded file
              mimeType: req.file.mimetype,
              alt: req.body.title || banner.title
            };
            // Clear YouTube URL if switching away from YouTube background
            updateData.youtubeUrl = undefined;
          }
          // If no file is provided, leave the existing media unchanged
        }
      }

      // Update the banner document with the new data
      banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
      });

      res.status(200).json({
        success: true,
        data: banner
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating banner',
        error: error.message
      });
    }
  }
];
// @desc    Update banner status
// @route   PATCH /api/admin/banners/:id/status
// @access  Private/Admin
exports.updateBannerStatus = async (req, res) => {
    try {
        const { active } = req.body;

        if (active === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Active status is required'
            });
        }

        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true }
        ).populate('media');

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            data: banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating banner status',
            error: error.message
        });
    }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        // Delete the banner
        await banner.deleteOne();

        // Reorder remaining banners if necessary
        const remainingBanners = await Banner.find().sort('priority');
        for (let i = 0; i < remainingBanners.length; i++) {
            if (remainingBanners[i].priority !== i + 1) {
                remainingBanners[i].priority = i + 1;
                await remainingBanners[i].save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting banner',
            error: error.message
        });
    }
};