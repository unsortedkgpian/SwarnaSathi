// utils/FileUpload.js
const multer = require("multer");
const multerS3 = require("multer-s3-v3"); // using the v3-compatible package
const { S3Client } = require("@aws-sdk/client-s3");

// Set up the S3 client using AWS SDK v3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Define allowed mime types for each category
const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
const allowedPdfTypes = ["application/pdf"];

// File filter: if mediaType is 'video', only allow allowed video types;
// otherwise, allow images and pdf files.
const fileFilter = (req, file, cb) => {
    if (req.body.mediaType === "video") {
        if (allowedVideoTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid video type. Only mp4, webm, and quicktime are allowed."
                ),
                false
            );
        }
    } else {
        if (
            allowedImageTypes.includes(file.mimetype) ||
            allowedPdfTypes.includes(file.mimetype)
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Only jpeg, png, gif, and pdf are allowed."
                ),
                false
            );
        }
    }
};

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: "public-read",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const filename = `${Date.now().toString()}-${file.originalname}`;
            cb(null, filename);
        },
    }),
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 50 }, // 50MB file size limit
});

module.exports = upload;
