// const Application = require("../models/application");
// const fs = require("fs");
// const path = require("path");

// // Create new application
// exports.createApplication = async (req, res) => {
//     try {
//         const data = JSON.parse(req.body.data);
//         const resumePath = req.file?.path;

//         if (!resumePath) {
//             return res.status(400).json({ message: "Resume is required" });
//         }

//         const application = new Application({
//             ...data,
//             resume: resumePath,
//         });

//         const savedApplication = await application.save();
//         res.status(201).json(savedApplication);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Get all applications
// exports.getAllApplications = async (req, res) => {
//     try {
//         const applications = await Application.find().sort({ createdAt: -1 });
//         res.json(applications);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Get single application
// exports.getApplication = async (req, res) => {
//     try {
//         const application = await Application.findById(req.params.id);
//         if (!application) {
//             return res.status(404).json({ message: "Application not found" });
//         }
//         res.json(application);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Update application
// exports.updateApplication = async (req, res) => {
//     try {
//         const application = await Application.findById(req.params.id);
//         if (!application) {
//             return res.status(404).json({ message: "Application not found" });
//         }

//         const data = req.body.data ? JSON.parse(req.body.data) : {};
//         const updateData = { ...data };

//         if (req.file) {
//             // Remove old resume
//             if (application.resume) {
//                 const oldResumePath = path.join(
//                     __dirname,
//                     "..",
//                     application.resume
//                 );
//                 fs.unlink(oldResumePath, (err) => console.log(err));
//             }
//             updateData.resume = req.file.path;
//         }

//         const updatedApplication = await Application.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true }
//         );
//         res.json(updatedApplication);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Delete application
// exports.deleteApplication = async (req, res) => {
//     try {
//         const application = await Application.findById(req.params.id);
//         if (!application) {
//             return res.status(404).json({ message: "Application not found" });
//         }

//         // Delete resume file
//         if (application.resume) {
//             const resumePath = path.join(__dirname, "..", application.resume);
//             fs.unlink(resumePath, (err) => console.log(err));
//         }

//         await Application.findByIdAndDelete(req.params.id);
//         res.json({ message: "Application deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const Application = require("../models/application");
const fs = require("fs");
const path = require("path");

exports.createApplication = async (req, res) => {
    try {
        const formData = JSON.parse(req.body.data); // sent as string from frontend
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({ message: "Resume is required" });
        }

        // Attach the path to the resume in form data
        formData.resume = resumeFile.path;

        const application = new Application(formData);
        const savedApplication = await application.save();

        res.status(201).json(savedApplication);
    } catch (error) {
        console.error("Application error:", error);
        res.status(400).json({
            message: error.message || "Something went wrong",
        });
    }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single application by ID
exports.getApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update application
exports.updateApplication = async (req, res) => {
    try {
        const existingApp = await Application.findById(req.params.id);
        if (!existingApp) {
            return res.status(404).json({ message: "Application not found" });
        }

        const updateData = req.body;

        // If resume path is changed, delete the old one
        if (updateData.resume && updateData.resume !== existingApp.resume) {
            const oldResumePath = path.join(
                __dirname,
                "..",
                existingApp.resume
            );
            fs.unlink(oldResumePath, (err) => {
                if (err) console.log("Old resume delete error:", err);
            });
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(updatedApplication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete application
exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Delete resume file
        if (application.resume) {
            const resumePath = path.join(__dirname, "..", application.resume);
            fs.unlink(resumePath, (err) => {
                if (err) console.log("Resume delete error:", err);
            });
        }

        await Application.findByIdAndDelete(req.params.id);
        res.json({ message: "Application deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
