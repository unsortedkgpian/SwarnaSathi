const express = require('express');
const router = express.Router();
const {
    createTeamMember,
    getTeamMembers,
    getTeamMember,
    updateTeamMember,
    deleteTeamMember,
    reorderTeamMembers
} = require('../controllers/teamControllers');
const upload = require('../utils/FileUpload');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(getTeamMembers)
    .post(protect, authorize('admin'), createTeamMember);

router.put('/reorder', protect, authorize('admin'), reorderTeamMembers);

router
    .route('/:id')
    .get(getTeamMember)
    .put(protect, authorize('admin'), updateTeamMember)
    .delete(protect, authorize('admin'), deleteTeamMember);

module.exports = router;