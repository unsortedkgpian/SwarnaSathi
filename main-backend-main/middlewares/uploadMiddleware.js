// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create directories if they don't exist
const createDirectories = () => {
    const dirs = ['uploads', 'uploads/images', 'uploads/videos'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createDirectories();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Not a video file!'), false);
        }
    } else {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image file!'), false);
        }
    }
};

const uploadConfig = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB limit
    }
});

// Create specific middleware for different upload scenarios
const uploadMedia = uploadConfig.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

const uploadGallery = uploadConfig.array('gallery', 10);

module.exports = { uploadMedia, uploadGallery };