const Gallery = require('../models/Gallery.js');
const upload = require('../utils/FileUpload.js');

// @desc    Upload media to gallery (store file in database)
// @route   POST /api/admin/gallery
// @access  Private/Admin
exports.uploadMedia = [
  upload.single('media'),
  async (req, res) => {
    try {
      const { title, mediaType, alt } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a file'
        });
      }

      // Since we're using memory storage, the file is available as req.file.buffer
      const gallery = await Gallery.create({
        title: title || req.file.originalname,
        mediaType,
        fileData: req.file.buffer, // store the binary data directly in the DB
        mimeType: req.file.mimetype,
        alt: alt || title || req.file.originalname,
        uploadedBy: req.user._id
      });

      res.status(201).json({
        success: true,
        data: gallery
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading media',
        error: error.message
      });
    }
  }
];

// @desc    Get all media
// @route   GET /api/admin/gallery
// @access  Private/Admin
exports.getAllMedia = async (req, res) => {
  try {
    const { mediaType, page = 1, limit = 10 } = req.query;
    const query = mediaType ? { mediaType } : {};

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: 'uploadedBy'
    };

    const gallery = await Gallery.paginate(query, options);

    res.status(200).json({
      success: true,
      data: gallery.docs,
      pagination: {
        total: gallery.totalDocs,
        page: gallery.page,
        pages: gallery.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching media',
      error: error.message
    });
  }
};

// @desc    Delete media
// @route   DELETE /api/admin/gallery/:id
// @access  Private/Admin
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Gallery.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if media is being used by any banner
    const Banner = require('../models/Banner');
    const inUse = await Banner.exists({ media: media._id });

    if (inUse) {
      return res.status(400).json({
        success: false,
        message: 'Media is currently in use by a banner'
      });
    }

    // No physical file to delete, as the file is stored in the database.
    await media.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting media',
      error: error.message
    });
  }
};

// @desc    Update media details
// @route   PUT /api/admin/gallery/:id
// @access  Private/Admin
exports.updateMedia = async (req, res) => {
  try {
    const { title, alt } = req.body;
    const media = await Gallery.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    media.title = title || media.title;
    media.alt = alt || media.alt;

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating media',
      error: error.message
    });
  }
};