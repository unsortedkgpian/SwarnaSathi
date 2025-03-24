const JobOpening = require('../models/JobOpenings');

// Create a new job opening
exports.createJobOpening = async (req, res) => {
  try {
    const { jobName, role, location, googleSheetLink } = req.body;
    if (!jobName || !role || !location || !googleSheetLink) {
      return res.status(400).json({ message: 'All fields (jobName, role, location, googleSheetLink) are required' });
    }

    const jobOpening = new JobOpening({
      jobName,
      role,
      location,
      googleSheetLink
    });

    const savedJobOpening = await jobOpening.save();
    res.status(201).json(savedJobOpening);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all job openings
exports.getAllJobOpenings = async (req, res) => {
  try {
    const jobOpenings = await JobOpening.find();
    res.json(jobOpenings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single job opening
exports.getJobOpening = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findById(req.params.id);
    if (!jobOpening) {
      return res.status(404).json({ message: 'Job opening not found' });
    }
    res.json(jobOpening);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job opening
exports.updateJobOpening = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findById(req.params.id);
    if (!jobOpening) {
      return res.status(404).json({ message: 'Job opening not found' });
    }

    const { jobName, role, location, googleSheetLink } = req.body;
    const updateData = {
      jobName: jobName || jobOpening.jobName,
      role: role || jobOpening.role,
      location: location || jobOpening.location,
      googleSheetLink: googleSheetLink || jobOpening.googleSheetLink
    };

    const updatedJobOpening = await JobOpening.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedJobOpening);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete job opening
exports.deleteJobOpening = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findById(req.params.id);
    if (!jobOpening) {
      return res.status(404).json({ message: 'Job opening not found' });
    }

    await JobOpening.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job opening deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};