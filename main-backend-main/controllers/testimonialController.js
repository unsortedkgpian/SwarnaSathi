const Testimonial = require("../models/Testimonial");
const fs = require("fs");
const path = require("path");

// Create a new testimonial
exports.createTestimonial = async (req, res) => {
    try {
        const { name, text } = req.body;
        if (!name || !text || !req.file) {
            return res
                .status(400)
                .json({ message: "Name, text, and image are required" });
        }

        const testimonial = new Testimonial({
            name,
            text,
            img: req.file.path,
        });

        const savedTestimonial = await testimonial.save();
        res.status(201).json(savedTestimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all testimonials
exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single testimonial
exports.getTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        res.json(testimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }

        const updateData = {
            name: req.body.name || testimonial.name,
            text: req.body.text || testimonial.text,
        };

        // If new image is uploaded, delete old one and update path
        if (req.file) {
            fs.unlink(testimonial.img, (err) => {
                if (err) console.log("Error deleting old image:", err);
            });
            updateData.img = req.file.path;
        }

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(updatedTestimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }

        // Delete image from storage
        fs.unlink(testimonial.img, (err) => {
            if (err) console.log("Error deleting image:", err);
        });

        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
