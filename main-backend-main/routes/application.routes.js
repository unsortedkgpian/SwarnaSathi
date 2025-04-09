const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const upload = require("../utils/FileUpload");

// POST - Create new application
router.post(
    "/",
    upload.single("resume"),
    applicationController.createApplication
);

// GET - Get all applications
router.get("/", applicationController.getAllApplications);

// GET - Get single application
router.get("/:id", applicationController.getApplication);

// PUT - Update application
router.put(
    "/:id",
    upload.single("resume"),
    applicationController.updateApplication
);

// DELETE - Delete application
router.delete("/:id", applicationController.deleteApplication);

module.exports = router;
