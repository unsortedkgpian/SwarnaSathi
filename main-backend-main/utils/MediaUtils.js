const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const generateThumbnail = async (filePath, width, height, quality = 80) => {
    const ext = path.extname(filePath);
    const thumbnailPath = filePath.replace(ext, `-thumb-${width}x${height}${ext}`);
    
    await sharp(filePath)
        .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
        .jpeg({ quality })
        .toFile(thumbnailPath);

    return thumbnailPath;
};

const getImageDimensions = async (filePath) => {
    const metadata = await sharp(filePath).metadata();
    return {
        width: metadata.width,
        height: metadata.height
    };
};

const isImage = (mimeType) => {
    return mimeType.startsWith('image/');
};

const isVideo = (mimeType) => {
    return mimeType.startsWith('video/');
};

module.exports = {
    generateThumbnail,
    getImageDimensions,
    isImage,
    isVideo
};