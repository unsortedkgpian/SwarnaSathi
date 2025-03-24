const express = require('express');
const router = express.Router();
const jobOpeningController = require('../controllers/jobOpeningsControllers');

// Routes
router.post('/', jobOpeningController.createJobOpening);
router.get('/', jobOpeningController.getAllJobOpenings);
router.get('/:id', jobOpeningController.getJobOpening);
router.put('/:id', jobOpeningController.updateJobOpening);
router.delete('/:id', jobOpeningController.deleteJobOpening);

module.exports = router;