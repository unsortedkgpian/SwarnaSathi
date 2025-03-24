const TeamMember = require('../models/TeamMember');
const fs = require('fs');
const path = require('path');

// Create a new TeamMember
exports.createTeamMember = async (req, res) => {
  try {
    const { position, name, description, linkedinLink } = req.body;
    if (!position || !name || !description || !linkedinLink || !req.file) {
      return res.status(400).json({ message: 'All fields (position, image, name, description, linkedinLink) are required' });
    }

    const teamMember = new TeamMember({
      position,
      image: req.file.path,
      name,
      description,
      linkedinLink
    });

    const savedTeamMember = await teamMember.save();
    res.status(201).json(savedTeamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all TeamMembers
exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single TeamMember
exports.getTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update TeamMember
exports.updateTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    const updateData = {
      position: req.body.position || teamMember.position,
      name: req.body.name || teamMember.name,
      description: req.body.description || teamMember.description,
      linkedinLink: req.body.linkedinLink || teamMember.linkedinLink
    };

    // If new image is uploaded, delete old one and update path
    if (req.file) {
      fs.unlink(teamMember.image, (err) => {
        if (err) console.log('Error deleting old image:', err);
      });
      updateData.image = req.file.path;
    }

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedTeamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete TeamMember
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Delete image from storage
    fs.unlink(teamMember.image, (err) => {
      if (err) console.log('Error deleting image:', err);
    });

    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};