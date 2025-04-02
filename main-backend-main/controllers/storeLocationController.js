// const StoreLocation = require('../models/StoreLocation');

// // Create a new store location
// exports.createStoreLocation = async (req, res) => {
//   try {
//     const { locationName, locationLink } = req.body;
//     if (!locationName || !locationLink) {
//       return res.status(400).json({ message: 'Location name and link are required' });
//     }

//     const storeLocation = new StoreLocation({
//       locationName,
//       locationLink
//     });

//     const savedStoreLocation = await storeLocation.save();
//     res.status(201).json(savedStoreLocation);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get all store locations
// exports.getAllStoreLocations = async (req, res) => {
//   try {
//     const storeLocations = await StoreLocation.find();
//     res.json(storeLocations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get single store location
// exports.getStoreLocation = async (req, res) => {
//   try {
//     const storeLocation = await StoreLocation.findById(req.params.id);
//     if (!storeLocation) {
//       return res.status(404).json({ message: 'Store location not found' });
//     }
//     res.json(storeLocation);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update store location
// exports.updateStoreLocation = async (req, res) => {
//   try {
//     const storeLocation = await StoreLocation.findById(req.params.id);
//     if (!storeLocation) {
//       return res.status(404).json({ message: 'Store location not found' });
//     }

//     const { locationName, locationLink } = req.body;
//     const updateData = {
//       locationName: locationName || storeLocation.locationName,
//       locationLink: locationLink || storeLocation.locationLink
//     };

//     const updatedStoreLocation = await StoreLocation.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );
//     res.json(updatedStoreLocation);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete store location
// exports.deleteStoreLocation = async (req, res) => {
//   try {
//     const storeLocation = await StoreLocation.findById(req.params.id);
//     if (!storeLocation) {
//       return res.status(404).json({ message: 'Store location not found' });
//     }

//     await StoreLocation.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Store location deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const StoreLocation = require("../models/StoreLocation");

// Create a new store location
exports.createStoreLocation = async (req, res) => {
    try {
        const { name, address, longitude, latitude, description } = req.body;

        if (!name || !address || !longitude || !latitude) {
            return res
                .status(400)
                .json({
                    message: "Name, address, and coordinates are required",
                });
        }

        const storeLocation = new StoreLocation({
            name,
            address,
            longitude: Number(longitude),
            latitude: Number(latitude),
            description,
        });

        const savedLocation = await storeLocation.save();
        res.status(201).json(savedLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all store locations
exports.getAllStoreLocations = async (req, res) => {
    try {
        const locations = await StoreLocation.find();
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single store location
exports.getStoreLocation = async (req, res) => {
    try {
        const location = await StoreLocation.findById(req.params.id);
        if (!location) {
            return res
                .status(404)
                .json({ message: "Store location not found" });
        }
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update store location
exports.updateStoreLocation = async (req, res) => {
    try {
        const location = await StoreLocation.findById(req.params.id);
        if (!location) {
            return res
                .status(404)
                .json({ message: "Store location not found" });
        }

        const updateData = {
            name: req.body.name || location.name,
            address: req.body.address || location.address,
            longitude: req.body.longitude
                ? Number(req.body.longitude)
                : location.longitude,
            latitude: req.body.latitude
                ? Number(req.body.latitude)
                : location.latitude,
            description: req.body.description || location.description,
        };

        const updatedLocation = await StoreLocation.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(updatedLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete store location
exports.deleteStoreLocation = async (req, res) => {
    try {
        const location = await StoreLocation.findById(req.params.id);
        if (!location) {
            return res
                .status(404)
                .json({ message: "Store location not found" });
        }

        await StoreLocation.findByIdAndDelete(req.params.id);
        res.json({ message: "Store location deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};