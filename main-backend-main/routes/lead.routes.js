const express = require('express');
const router = express.Router();
const { createLead , 
    getAllLeads,
  getLeadByPhone } = require('../controllers/leadController');

// POST new lead
router.post('/', createLead);
// GET all leads
router.get('/', getAllLeads);
// GET lead by phone
router.get('/:phone', getLeadByPhone);

module.exports = router;