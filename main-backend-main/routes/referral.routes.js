const express = require("express");
const router = express.Router();
const referralController = require("../controllers/referralController");

// CREATE - Create new referral code
router.post("/", referralController.createReferral);

// READ - Get referral statistics
router.get("/stats", referralController.getReferralStats);

// READ - Get all referrals (with optional filters)
router.get("/", referralController.getAllReferrals);

// READ - Get single referral by ID
router.get("/:id", referralController.getReferral);

// READ - Get referral by referral code
router.get("/code/:referralId", referralController.getReferralByCode);

// READ - Get referrals by referer phone
router.get("/phone/:phone", referralController.getReferralsByPhone);

// UPDATE - Add referred user to a referral
router.post("/:id/referred", referralController.addReferredUser);

// UPDATE - Toggle referral active status
router.patch("/:id/toggle-status", referralController.toggleReferralStatus);

// DELETE - Delete referral
router.delete("/:id", referralController.deleteReferral);

// UPDATE - Add referred user to a referral code (using referral code directly)
router.post("/code/:referralId/add-user", referralController.addReferredUserToCode);

module.exports = router;