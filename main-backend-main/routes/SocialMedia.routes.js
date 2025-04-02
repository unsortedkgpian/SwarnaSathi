const express = require("express");
const router = express.Router();
// const contactController = require("../controllers/contactUsController");
const socialMediaController = require("../controllers/SocialMediaController");

// Routes
router.get("/", socialMediaController.getSocialMedia); // Get the contact details
router.put("/", socialMediaController.updateSocialMedia); // Update the contact details
router.post("/", socialMediaController.createSocialMedia); // Create new Contact details

module.exports = router;
