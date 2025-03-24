const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const upload = require('../helpers/fileUploads');

// Routes
router.post('/', upload.single('img'), partnerController.createPartner);
router.get('/', partnerController.getAllPartners);
router.get('/:id', partnerController.getPartner);
router.put('/:id', upload.single('img'), partnerController.updatePartner);
router.delete('/:id', partnerController.deletePartner);

module.exports = router;