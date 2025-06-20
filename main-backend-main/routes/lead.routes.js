const express = require('express');
const router = express.Router();
const { createLead,
  getAllLeads,
  getLeadByPhone,
  updateLeadVerificationStatus,
  deleteLeadById,
  checkPincode } = require('../controllers/leadController');

// POST new lead
router.post('/check-pincode', checkPincode);
router.post('/', createLead);
// GET all leads
router.get('/', getAllLeads);
// GET lead by phone
router.get('/:phone', getLeadByPhone);

router.patch('/:id/verify', updateLeadVerificationStatus);

router.delete('/:id', deleteLeadById);

module.exports = router;