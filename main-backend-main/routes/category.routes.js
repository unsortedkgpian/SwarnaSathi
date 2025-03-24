const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    updateGallery
} = require('../controllers/categoryController');
const { uploadMedia, uploadGallery } = require('../middlewares/uploadMiddleware');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(getCategories)
    .post(protect, authorize('admin'), uploadMedia, createCategory);

router
    .route('/:id')
    .get(getCategory)
    .put(protect, authorize('admin'), uploadMedia, updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

router
    .route('/:id/gallery')
    .put(protect, authorize('admin'), uploadGallery, updateGallery);

module.exports = router;