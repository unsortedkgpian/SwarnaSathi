const Partner = require('../models/Partner');
const fs = require('fs');
const path = require('path');

// Create a new partner
exports.createPartner = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !req.file) {
      return res.status(400).json({ message: 'Title and image are required' });
    }

    const partner = new Partner({
      title,
      img: req.file.path
    });

    const savedPartner = await partner.save();
    res.status(201).json(savedPartner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single partner
exports.getPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update partner
exports.updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const updateData = {
      title: req.body.title || partner.title
    };

    // If new image is uploaded, delete old one and update path
    if (req.file) {
      fs.unlink(partner.img, (err) => {
        if (err) console.log('Error deleting old image:', err);
      });
      updateData.img = req.file.path;
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedPartner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete partner
exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Delete image from storage
    fs.unlink(partner.img, (err) => {
      if (err) console.log('Error deleting image:', err);
    });

    await Partner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};