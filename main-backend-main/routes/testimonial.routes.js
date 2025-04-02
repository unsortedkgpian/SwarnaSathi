const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const upload = require("../helpers/fileUploads");

// Routes
router.post("/", upload.single("img"), testimonialController.createTestimonial);
router.get("/", testimonialController.getAllTestimonials);
router.get("/:id", testimonialController.getTestimonial);
router.put(
    "/:id",
    upload.single("img"),
    testimonialController.updateTestimonial
);
router.delete("/:id", testimonialController.deleteTestimonial);

module.exports = router;
