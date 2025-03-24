const express = require('express');
const router = express.Router();
const {
    createOffer,
    getOffers,
    getOffer,
    updateOffer,
    deleteOffer,
    trackClick
} = require('../controllers/offerControllers.js');
const { protect, authorize } = require('../middlewares/auth.js');

// Public routes
router.get('/', getOffers);
router.get('/:id', getOffer);
router.post('/:id/track-click', trackClick);

// Protected routes
router.post('/', protect, authorize('admin'), createOffer);
router.put('/:id', protect, authorize('admin'), updateOffer);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router;