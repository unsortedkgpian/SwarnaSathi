const Lead = require('../models/Lead');
const Pincode = require('../models/Pincode');

const checkPincode = async (req, res) => {
  const { pincode, phone } = req.body;
  const pincodeExists = await Pincode.findOne({ pincode: pincode });
  if (!pincodeExists) {
    return res.status(400).json({
      success: false,
      message: "We are not currently serviceable in this location. We will contact you once we get there. Thank you for showing interest in Swarn Sathi",
    });
  }
  const existingLead = await Lead.findOne({ phone });
  if (existingLead) {
    return res.status(400).json({
      success: false,
      message: "A lead with this phone number already exists.",
    });
  }


  return res.status(200).json({
    success: true,
    message: "OTP sent to your phone number",
    data: {
      pincodeExists,
      existingLead
    }
  });
};

// Create new lead
const createLead = async (req, res) => {
  try {
    const { name, phone, pincode, qualityOfGold, quantityOfGold , leadId } = req.body;

    // Check if pincode exists in Pincode schema
    const pincodeExists = await Pincode.findOne({ pincode: pincode });
    if (!pincodeExists) {
      return res.status(400).json({
        success: false,
        message: "We are not currently serviceable in this location. We will contact you once we get there. Thank you for showing interest in Swarn Sathi",
      });
    }

    // Check if lead with this phone already exists
    const existingLead = await Lead.findOne({ phone });
    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this phone number already exists.',
      });
    }



    // Create new lead
    const newLead = new Lead({
      leadId,
      name,
      phone,
      pincode,
      qualityOfGold,
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

const updateLeadVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Error updating verification status:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteAllLeads = async (req, res) => {
  try {
    const result = await Lead.deleteMany({}); // delete all documents

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} leads successfully`,
    });
  } catch (error) {
    console.error('Error deleting all leads:', error.message);
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
  updateLeadVerificationStatus,
  deleteLeadById,
  checkPincode,
  deleteAllLeads
};
