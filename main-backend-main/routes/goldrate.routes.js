const express = require("express");
const router = express.Router();
const goldRateController = require("../controllers/GoldRateControllers");

// Routes
router.get("/", goldRateController.getGoldRateSettings); // Get all gold rates
router.post("/", goldRateController.createGoldRateSettings); // Create a new gold rate
router.put("/", goldRateController.updateGoldRateSettings); // Update a specific gold rate
 // Delete a specific gold rate

module.exports = router;