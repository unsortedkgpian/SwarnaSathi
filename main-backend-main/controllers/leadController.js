const Lead = require('../models/Lead');

// Create new lead
const createLead = async (req, res) => {
  try {
    const { name, phone, pincode, qualityOfGold, quantityOfGold } = req.body;

    const existingLead = await Lead.findOne({ phone });
    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this phone number already exists.',
      });
    }

    const newLead = new Lead({
      name,
      phone,
      pincode,
      qualityOfGold: isNaN(Number(qualityOfGold)) ? undefined : Number(qualityOfGold),
      quantityOfGold: isNaN(Number(quantityOfGold)) ? undefined : Number(quantityOfGold),
    });

    await newLead.save();

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead,
    });
  } catch (error) {
    console.error('Error creating lead:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error('Error fetching leads:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// Get lead by phone number
const getLeadByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const lead = await Lead.findOne({ phone });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found for this phone number',
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Error fetching lead:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadByPhone,
};
