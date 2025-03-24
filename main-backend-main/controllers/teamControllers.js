const Team = require('../models/Team');
const Gallery = require('../models/Gallery');
const upload = require('../utils/FileUpload');

// @desc    Create team member
// @route   POST /api/team
// @access  Private/Admin
exports.createTeamMember = [
    upload.single('image'),
    async (req, res) => {
      try {
        const { name, category,position, description, socialMedia } = req.body;
  
        // Validate required fields
        if (!name || !category || !description || !position) {
          return res.status(400).json({
            success: false,
            message: 'Please provide all required fields'
          });
        }
  
        // Prepare team data
        let teamData = {
          name,
          category,
          position,
          description,
          socialMedia: {
            linkedin: "",
            twitter: "",
            facebook: "",
            instagram: "",
            website: ""
          },
          order: (await Team.countDocuments()) + 1
        };
  
        // If an image was uploaded, multer-s3 will have already uploaded it to S3.
        // The file details, including the S3 URL, are available in req.file.
        if (req.file) {
          teamData.image = {
            file: req.file.location,     // S3 URL of the uploaded image
            mimeType: req.file.mimetype,
            alt: name
          };
  
          // Optionally, create a record in the Gallery collection
          await Gallery.create({
            file: req.file.location,
            mimeType: req.file.mimetype,
            alt: name,
            uploadedBy: req.user && req.user._id ? req.user._id : 'system', // or another default value
            mediaType: 'image', // Since you're uploading an image
            title: name       // Using the team member's name as the media title
          });
        }
  
        // Create the team member document in the database
        const teamMember = await Team.create(teamData);
  
        return res.status(201).json({
          success: true,
          data: teamMember
        });
      } catch (error) {
        console.error('Error creating team member:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating team member',
          error: error.message
        });
      }
    }
  ];
// @desc    Get all team members
// @route   GET /api/team
// @access  Public
exports.getTeamMembers = async (req, res) => {
    try {
        const query = {};
        
        // Filter by category if provided
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter active only if specified
        if (req.query.active) {
            query.active = req.query.active === 'true';
        }

        const teamMembers = await Team.find(query).sort('order');

        res.status(200).json({
            success: true,
            count: teamMembers.length,
            data: teamMembers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching team members',
            error: error.message
        });
    }
};

// @desc    Get team member by ID
// @route   GET /api/team/:id
// @access  Public
exports.getTeamMember = async (req, res) => {
    try {
        const teamMember = await Team.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found'
            });
        }

        res.status(200).json({
            success: true,
            data: teamMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching team member',
            error: error.message
        });
    }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
exports.updateTeamMember = [
    upload.single('image'),
    async (req, res) => {
      try {
        let teamMember = await Team.findById(req.params.id);
  
        if (!teamMember) {
          return res.status(404).json({
            success: false,
            message: 'Team member not found'
          });
        }
  
        // Copy all request body fields to updateData
        const updateData = { ...req.body };
  
        // If socialMedia is provided as a JSON string, parse it
        if (req.body.socialMedia) {
          updateData.socialMedia = JSON.parse(req.body.socialMedia);
        }
  
        // If a new image file is provided, use its S3 URL from multer-s3
        if (req.file) {
          updateData.image = {
            file: req.file.location,        // S3 URL of the uploaded image
            mimeType: req.file.mimetype,
            alt: req.body.name || teamMember.name
          };
  
          // If you have a Gallery update process, you can add that logic here.
          // For example, you could find and update the corresponding Gallery record.
        }
  
        // Update the team member document
        teamMember = await Team.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true
          }
        );
  
        res.status(200).json({
          success: true,
          data: teamMember
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error updating team member',
          error: error.message
        });
      }
    }
  ];
// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
exports.deleteTeamMember = async (req, res) => {
    try {
        const teamMember = await Team.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found'
            });
        }

        await teamMember.deleteOne();

        // Reorder remaining team members
        const remainingMembers = await Team.find().sort('order');
        for (let i = 0; i < remainingMembers.length; i++) {
            remainingMembers[i].order = i + 1;
            await remainingMembers[i].save();
        }

        res.status(200).json({
            success: true,
            message: 'Team member deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting team member',
            error: error.message
        });
    }
};

// @desc    Reorder team members
// @route   PUT /api/team/reorder
// @access  Private/Admin
exports.reorderTeamMembers = async (req, res) => {
    try {
        const { orders } = req.body;

        if (!Array.isArray(orders)) {
            return res.status(400).json({
                success: false,
                message: 'Orders must be an array'
            });
        }

        for (const item of orders) {
            await Team.findByIdAndUpdate(item.id, { order: item.order });
        }

        const updatedTeam = await Team.find().sort('order');

        res.status(200).json({
            success: true,
            data: updatedTeam
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reordering team members',
            error: error.message
        });
    }
};