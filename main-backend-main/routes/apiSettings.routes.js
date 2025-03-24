const express = require('express');
const router = express.Router();
const {
    createApiSettings,
    getApiSettings,
    updateApiSettings,
    deleteApiSettings,
    testApiConnection
} = require('../controllers/apiSettingsControllers.js');
const { protect, authorize } = require('../middlewares/auth.js');

router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(getApiSettings)
    .post(createApiSettings);

router
    .route('/:id')
    .put(updateApiSettings)
    .delete(deleteApiSettings);

router.post('/:id/test', testApiConnection);

module.exports = router;