const express = require('express');
const router = express.Router();
const {
    uploadMedia,
    getAllMedia,
    deleteMedia,
    updateMedia
} = require('../controllers/galleryControllers.js');

const {
    getAdminBanners,
    updateBanner,
    updateBannerStatus,
    createBanner,
    deleteBanner,
    getBanners,
    getActiveBanners,
    updatePriority,
    getBanner


} = require('../controllers/bannerController.js');
const upload = require('../utils/FileUpload.js');
const { protect, authorize } = require('../middlewares/auth.js');

// Gallery routes
router.route('/gallery')
    .get(protect, authorize('admin'),getAllMedia)
    .post(protect, authorize('admin'),uploadMedia);

router.route('/gallery/:id')
    .put(protect, authorize('admin'),updateMedia)
    .delete(deleteMedia);


// Banner routes
router.route('/public/banners')
    .get(getBanners);

router.route('/banners')
    .get(protect, authorize('admin'),getAdminBanners)
    .post(protect, authorize('admin'),createBanner)
    .put(protect, authorize('admin'),updatePriority);

router.route('/banners/active')
    .get(getActiveBanners)

router.route('/banners/:id')
    .get(protect, authorize('admin'),getBanner)
    .put(protect, authorize('admin'),updateBanner)
    .delete(protect, authorize('admin'),deleteBanner);

router.route('/banners/:id/status')
    .patch(protect, authorize('admin'),updateBannerStatus);

module.exports = router;