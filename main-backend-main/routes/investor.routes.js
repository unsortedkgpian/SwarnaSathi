// routes/investorDeskRoutes.js
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getInvestorDesk,
  createSection,
  updateSection,
  deleteSection,
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getSection
} = require('../controllers/investorControllers.js');

// Import middleware
const upload = require('../utils/FileUpload.js');  // your pre-configured multer for Amazon S3


/* 
  PUBLIC ROUTE
  GET /api/investor-desk
*/
router.get('/', getInvestorDesk);

// Section routes
router.post('/sections', createSection);
router.get('/sections/:sectionId', getSection);
router.put('/sections/:sectionId', updateSection);
router.delete('/sections/:sectionId', deleteSection);

// Document routes within a section
router.post('/sections/:sectionId/documents', upload.single('file'), addDocument);
router.put('/sections/:sectionId/documents/:docId', updateDocument);
router.delete('/sections/:sectionId/documents/:docId', deleteDocument);
router.get('/sections/:sectionId/documents/:docId', getDocument);

module.exports = router;