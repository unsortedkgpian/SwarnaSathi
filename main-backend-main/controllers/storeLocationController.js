const StoreLocation = require('../models/StoreLocation');

// Create a new store location
exports.createStoreLocation = async (req, res) => {
  try {
    const { locationName, locationLink } = req.body;
    if (!locationName || !locationLink) {
      return res.status(400).json({ message: 'Location name and link are required' });
    }

    const storeLocation = new StoreLocation({
      locationName,
      locationLink
    });

    const savedStoreLocation = await storeLocation.save();
    res.status(201).json(savedStoreLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all store locations
exports.getAllStoreLocations = async (req, res) => {
  try {
    const storeLocations = await StoreLocation.find();
    res.json(storeLocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single store location
exports.getStoreLocation = async (req, res) => {
  try {
    const storeLocation = await StoreLocation.findById(req.params.id);
    if (!storeLocation) {
      return res.status(404).json({ message: 'Store location not found' });
    }
    res.json(storeLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update store location
exports.updateStoreLocation = async (req, res) => {
  try {
    const storeLocation = await StoreLocation.findById(req.params.id);
    if (!storeLocation) {
      return res.status(404).json({ message: 'Store location not found' });
    }

    const { locationName, locationLink } = req.body;
    const updateData = {
      locationName: locationName || storeLocation.locationName,
      locationLink: locationLink || storeLocation.locationLink
    };

    const updatedStoreLocation = await StoreLocation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedStoreLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete store location
exports.deleteStoreLocation = async (req, res) => {
  try {
    const storeLocation = await StoreLocation.findById(req.params.id);
    if (!storeLocation) {
      return res.status(404).json({ message: 'Store location not found' });
    }

    await StoreLocation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Store location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};