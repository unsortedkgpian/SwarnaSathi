const Pincode = require('../models/Pincode');

// POST /api/pincode - Create a new pincode entry
const createPincode = async (req, res) => {
    try {
        const pincodeEntry = new Pincode(req.body);
        await pincodeEntry.save();
        res.status(201).json(pincodeEntry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET /api/pincode - Fetch all pincode entries
const getAllPincodes = async (req, res) => {
    try {
        const pincodes = await Pincode.find();
        res.json(pincodes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPincode,
    getAllPincodes
};
