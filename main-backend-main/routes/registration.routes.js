const express = require("express");
const router = express.Router();
// const storeLocationController = require("../controllers/storeLocationController");
const RegistrationController = require("../controllers/registrationController");

// Routes
// router.post("/", storeLocationController.createStoreLocation);
// router.get("/", storeLocationController.getAllStoreLocations);
// router.get("/:id", storeLocationController.getStoreLocation);
// router.put("/:id", storeLocationController.updateStoreLocation);
// router.delete("/:id", storeLocationController.deleteStoreLocation);

router.get("/", RegistrationController.getAllRegistrations);
router.post("/", RegistrationController.createRegistration);

module.exports = router;
