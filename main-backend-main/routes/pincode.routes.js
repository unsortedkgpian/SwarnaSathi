const express = require('express');
const router = express.Router();
const { createPincode, getAllPincodes } = require('../controllers/pincodeController');

router.post('/', createPincode);
router.get('/', getAllPincodes);

module.exports = router;
