const HIW = require('../models/HIW');
const fs = require('fs');
const path = require('path');

// Create a new HIW
exports.createHIW = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description || !req.file) {
      return res.status(400).json({ message: 'Icon, title, and description are required' });
    }

    const hiw = new HIW({
      icon: req.file.path,
      title,
      description
    });

    const savedHIW = await hiw.save();
    res.status(201).json(savedHIW);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all HIWs
exports.getAllHIWs = async (req, res) => {
  try {
    const hiws = await HIW.find();
    res.json(hiws);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single HIW
exports.getHIW = async (req, res) => {
  try {
    const hiw = await HIW.findById(req.params.id);
    if (!hiw) {
      return res.status(404).json({ message: 'HIW not found' });
    }
    res.json(hiw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update HIW
exports.updateHIW = async (req, res) => {
  try {
    const hiw = await HIW.findById(req.params.id);
    if (!hiw) {
      return res.status(404).json({ message: 'HIW not found' });
    }

    const updateData = {
      title: req.body.title || hiw.title,
      description: req.body.description || hiw.description
    };

    // If new icon is uploaded, delete old one and update path
    if (req.file) {
      fs.unlink(hiw.icon, (err) => {
        if (err) console.log('Error deleting old icon:', err);
      });
      updateData.icon = req.file.path;
    }

    const updatedHIW = await HIW.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedHIW);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete HIW
exports.deleteHIW = async (req, res) => {
  try {
    const hiw = await HIW.findById(req.params.id);
    if (!hiw) {
      return res.status(404).json({ message: 'HIW not found' });
    }

    // Delete icon from storage
    fs.unlink(hiw.icon, (err) => {
      if (err) console.log('Error deleting icon:', err);
    });

    await HIW.findByIdAndDelete(req.params.id);
    res.json({ message: 'HIW deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};