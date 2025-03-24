const express = require('express');
const router = express.Router();
const hiwController = require('../controllers/hiwController');
const upload = require('../helpers/fileUploads');

// Routes
router.post('/', upload.single('icon'), hiwController.createHIW);
router.get('/', hiwController.getAllHIWs);
router.get('/:id', hiwController.getHIW);
router.put('/:id', upload.single('icon'), hiwController.updateHIW);
router.delete('/:id', hiwController.deleteHIW);

module.exports = router;