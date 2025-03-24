const express = require('express');
const router = express.Router();
const {
    uploadMedia,
    getMedia,
    updateMedia,
    deleteMedia
} = require('../controllers/mediaControllers.js');
const { protect, authorize } = require('../middlewares/auth.js');

router.use(protect);

router
    .route('/')
    .get(getMedia)
    .post(uploadMedia);

router
    .route('/:id')
    .put(updateMedia)
    .delete(authorize('admin'), deleteMedia);

module.exports = router;