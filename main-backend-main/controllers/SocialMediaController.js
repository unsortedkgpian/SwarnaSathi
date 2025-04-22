const SocialMedia = require("../models/SocialMedia");

/**
 * Get the social media links
 * @route GET /api/social
 */
exports.getSocialMedia = async (req, res) => {
    try {
        const social = await SocialMedia.findOne();
        
        if (!social) {
            return res.status(404).json({ 
                success: false,
                message: "Social media links not found" 
            });
        }
        
        return res.status(200).json(social);
    } catch (error) {
        console.error("Error fetching social media:", error);
        return res.status(500).json({ 
            success: false,
            message: "Server error while fetching social media links",
            error: error.message 
        });
    }
};

/**
 * Create new social media links
 * @route POST /api/social
 */
exports.createSocialMedia = async (req, res) => {
    try {
        // Check if entry already exists
        const existingEntry = await SocialMedia.findOne();
        
        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: "Social media entry already exists. Use PUT to update."
            });
        }
        
        const { facebook, twitter, instagram, linkedin } = req.body;
        
        // Validate required fields for creation
        if (!facebook || !twitter || !instagram || !linkedin) {
            return res.status(400).json({
                success: false,
                message: "All social media links are required for initial creation"
            });
        }
        
        // Create new entry
        const socialMedia = new SocialMedia({
            facebook,
            twitter,
            instagram,
            linkedin
        });
        
        const savedSocialMedia = await socialMedia.save();
        
        return res.status(201).json({
            success: true,
            message: "Social media links created successfully",
            data: savedSocialMedia
        });
    } catch (error) {
        console.error("Error creating social media:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating social media links",
            error: error.message
        });
    }
};

/**
 * Update social media links
 * @route PUT /api/social
 */
exports.updateSocialMedia = async (req, res) => {
    try {
        const { facebook, twitter, instagram, linkedin } = req.body;
        
        // Find existing entry
        let socialMedia = await SocialMedia.findOne();
        
        if (!socialMedia) {
            // If no entry exists, create new one with provided values (or empty strings)
            socialMedia = new SocialMedia({
                facebook: facebook || "",
                twitter: twitter || "",
                instagram: instagram || "",
                linkedin: linkedin || ""
            });
        } else {
            // Update existing entry with new values or keep existing ones
            socialMedia.facebook = facebook || socialMedia.facebook;
            socialMedia.twitter = twitter || socialMedia.twitter;
            socialMedia.instagram = instagram || socialMedia.instagram;
            socialMedia.linkedin = linkedin || socialMedia.linkedin;
        }
        
        // Save changes
        const updatedSocialMedia = await socialMedia.save();
        
        return res.status(200).json({
            success: true,
            message: "Social media links updated successfully",
            data: updatedSocialMedia
        });
    } catch (error) {
        console.error("Error updating social media:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating social media links",
            error: error.message
        });
    }
};
