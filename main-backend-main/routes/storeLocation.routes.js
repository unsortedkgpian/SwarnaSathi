const express = require('express');
const router = express.Router();
const storeLocationController = require('../controllers/storeLocationController');

// Routes
router.post('/', storeLocationController.createStoreLocation);
router.get('/', storeLocationController.getAllStoreLocations);
router.get('/:id', storeLocationController.getStoreLocation);
router.put('/:id', storeLocationController.updateStoreLocation);
router.delete('/:id', storeLocationController.deleteStoreLocation);

module.exports = router;