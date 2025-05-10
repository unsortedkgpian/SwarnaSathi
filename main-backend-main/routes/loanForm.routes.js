const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanFormController");

// CREATE - Submit new loan application
router.post("/", loanController.createLoanForm);

// READ - Get all loan applications (with optional filters)
router.get("/", loanController.getAllLoanForms);

// READ - Get single loan application by ID
router.get("/:id", loanController.getLoanForm);

// READ - Get loan application by phone number
router.get("/phone/:phone", loanController.getLoanByPhone);

// UPDATE - Update loan application
router.put("/:id", loanController.updateLoanForm);

// DELETE - Delete loan application by ID
router.delete("/:id", loanController.deleteLoanForm);

// DELETE - Delete loan application by phone number
router.delete("/phone/:phone", loanController.deleteLoanByPhone);

module.exports = router;