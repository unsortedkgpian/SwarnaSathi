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
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        // Log the uploaded file details
        console.log("Uploaded file details:", {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        // Parse the JSON data
        let formData;
        try {
            formData = JSON.parse(req.body.data);
        } catch (parseError) {
            console.error('Error parsing form data:', parseError);
            return res.status(400).json({ message: "Invalid form data format" });
        }

        // Create resume object from uploaded file
        const resumeData = {
            originalName: req.file.originalname,
            fileName: req.file.filename,
            path: req.file.path.replace(/\\/g, '/'), // Normalize path for cross-platform
            mimeType: req.file.mimetype,
            size: req.file.size
        };

        // Validate file size (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
        if (resumeData.size > MAX_FILE_SIZE) {
            // Delete the uploaded file
            fs.unlink(resumeData.path, (err) => {
                if (err) console.error('Error deleting oversized file:', err);
            });
            return res.status(400).json({ message: "File size exceeds 10MB limit" });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(resumeData.mimeType)) {
            // Delete the uploaded file
            fs.unlink(resumeData.path, (err) => {
                if (err) console.error('Error deleting invalid file type:', err);
            });
            return res.status(400).json({ message: "Invalid file type. Only PDF, DOC, and DOCX files are allowed" });
        }

        // Create new application with form data and resume info
        const application = new Application({
            personalInfo: formData.personalInfo,
            positionDetails: formData.positionDetails,
            educationalBackground: formData.educationalBackground,
            workExperience: formData.workExperience,
            skills: formData.skills,
            references: formData.references,
            declaration: formData.declaration,
            resume: resumeData
        });

        // Save the application
        const savedApplication = await application.save();

        res.status(201).json({
            message: "Application submitted successfully",
            application: savedApplication
        });
    } catch (error) {
        // If there's an error, clean up any uploaded file
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file after save error:', err);
            });
        }

        console.error('Application creation error:', error);
        res.status(500).json({
            message: "Failed to submit application",
            error: error.message
        });
    }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()// Exclude the file path for security
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single application by ID
exports.getApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)// Exclude the file path for security
        
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download resume
exports.downloadResume = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !application.resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        const filePath = path.join(__dirname, '..', application.resume.path);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Resume file not found" });
        }

        res.setHeader('Content-Type', application.resume.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${application.resume.originalName}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
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

        let updateData = req.body;
        
        // Handle resume update if new file is uploaded
        if (req.file) {
            // Delete old resume file
            if (existingApp.resume && existingApp.resume.path) {
                fs.unlink(path.join(__dirname, '..', existingApp.resume.path), (err) => {
                    if (err) console.error("Old resume delete error:", err);
                });
            }

            // Update with new resume data
            updateData.resume = {
                originalName: req.file.originalname,
                fileName: req.file.filename,
                path: req.file.path.replace(/\\/g, '/'),
                mimeType: req.file.mimetype,
                size: req.file.size
            };
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-resume.path');

        res.json(updatedApplication);
    } catch (error) {
        // Clean up uploaded file if there's an error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file after update error:', err);
            });
        }
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
        if (application.resume && application.resume.path) {
            const resumePath = path.join(__dirname, '..', application.resume.path);
            fs.unlink(resumePath, (err) => {
                if (err) console.error("Resume delete error:", err);
            });
        }

        await Application.findByIdAndDelete(req.params.id);
        res.json({ message: "Application deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};