const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactUsController");

// Routes
router.get("/", contactController.getContact); // Get the contact details
router.put("/", contactController.updateContact); // Update the contact details
router.post("/", contactController.createContact);// Create new Contact details

module.exports = router;
