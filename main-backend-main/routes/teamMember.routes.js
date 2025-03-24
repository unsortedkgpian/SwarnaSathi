const express = require('express');
const router = express.Router();
const teamMemberController = require('../controllers/teamMemberControllers');
const upload = require('../helpers/fileUploads');

// Routes
router.post('/', upload.single('image'), teamMemberController.createTeamMember);
router.get('/', teamMemberController.getAllTeamMembers);
router.get('/:id', teamMemberController.getTeamMember);
router.put('/:id', upload.single('image'), teamMemberController.updateTeamMember);
router.delete('/:id', teamMemberController.deleteTeamMember);

module.exports = router;