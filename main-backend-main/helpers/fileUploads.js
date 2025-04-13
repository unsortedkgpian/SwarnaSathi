const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      // Choose destination based on file type
      const dest = file.fieldname === 'resume' ? './uploads/resumes/' : './uploads/images/';
      cb(null, dest);
  },
  filename: (req, file, cb) => {
      // Create unique filename with original extension
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
const checkFileType = (file, cb) => {
  if (file.fieldname === 'resume') {
      // For resume files
      const filetypes = /pdf|doc|docx/;
      const mimetypes = /application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;
      
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = mimetypes.test(file.mimetype);

      if (extname && mimetype) {
          return cb(null, true);
      } else {
          cb('Error: Only PDF, DOC, or DOCX files are allowed!');
      }
  } else {
      // For image files
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (extname && mimetype) {
          return cb(null, true);
      } else {
          cb('Error: Images only!');
      }
  }
};
// Initialize upload
const upload = multer({
  storage: storage,
  limits: {
      fileSize: file => {
          // 10MB limit for resumes, 5MB for images
          return file.fieldname === 'resume' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      }
  },
  fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
  }
});

module.exports = upload;