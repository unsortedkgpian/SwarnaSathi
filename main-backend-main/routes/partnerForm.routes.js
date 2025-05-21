const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerFormController");

// CREATE - Submit new partner registration
router.post("/", partnerController.createPartnerForm);

// READ - Get all partner registrations (with optional filters)
router.get("/", partnerController.getAllPartnerForms);

// READ - Get single partner registration by ID
router.get("/:id", partnerController.getPartnerForm);

// READ - Get partner registration by phone number
router.get("/phone/:phone", partnerController.getPartnerByPhone);

// UPDATE - Update partner registration
router.put("/:id", partnerController.updatePartnerForm);

// DELETE - Delete partner registration by ID
router.delete("/:id", partnerController.deletePartnerForm);

// DELETE - Delete partner registration by phone number
router.delete("/phone/:phone", partnerController.deletePartnerByPhone);

module.exports = router;