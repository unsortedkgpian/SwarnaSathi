// // const ContactUs = require("../models/ContactUs");
// const SocialMedia = require("../models/SocialMedia")

// // Get the single contact entry
// exports.getSocialMedia = async (req, res) => {
//     try {
//         const social = await SocialMedia.findOne(); // Fetch the only contact entry
//         if (!social) {
//             return res
//                 .status(404)
//                 .json({ message: "Social Media links not found" });
//         }
//         res.json(soical);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.createSocialMedia = async (req, res) => {
//     try {
//         const { facebook, twitter, instagram, linkedin } = req.body;
//         let social = new SocialMedia({ phone, telephone, email, address });
//         const createSocialMedia = await social.save();
//         res.json(createSocialMedia);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// // Update the contact details
// exports.updateSocialMedia = async (req, res) => {
//     try {
//         const { facebook, twitter, instagram, linkedin } = req.body;
//         let social = await SocialMedia.findOne();

//         if (!social) {
//             // If no contact exists, create a new one
//             let social = new SocialMedia({ phone, telephone, email, address });
//         } else {
//             // Update existing contact details
//             contact.facebook = facebook || contact.facebook;
//             contact.twitter = twitter || contact.twitter;

//             contact.instagram = instagram || contact.instagram;
//             contact.linkedin = linkedin || contact.linkedin;
//         }

//         const updatedSocialMedia = await SocialMedia.save();
//         res.json(updatedSocialMedia);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const SocialMedia = require("../models/SocialMedia");

// Get the single contact entry
exports.getSocialMedia = async (req, res) => {
    try {
        const social = await SocialMedia.findOne(); // Fetch the only contact entry
        if (!social) {
            return res
                .status(404)
                .json({ message: "Social Media links not found" });
        }
        res.json(social); // Fixed typo
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
https: exports.createSocialMedia = async (req, res) => {
    try {
        const { facebook, twitter, instagram, linkedin } = req.body;
        let social = new SocialMedia({
            facebook,
            twitter,
            instagram,
            linkedin,
        }); // Fixed variables
        const createSocialMedia = await social.save();
        res.json(createSocialMedia);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update the contact details
exports.updateSocialMedia = async (req, res) => {
    try {
        const { facebook, twitter, instagram, linkedin } = req.body;
        let social = await SocialMedia.findOne();

        if (!social) {
            // If no social media entry exists, create a new one
            social = new SocialMedia({
                facebook,
                twitter,
                instagram,
                linkedin,
            });
        } else {
            // Update existing social media details
            social.facebook = facebook || social.facebook;
            social.twitter = twitter || social.twitter;
            social.instagram = instagram || social.instagram;
            social.linkedin = linkedin || social.linkedin;
        }

        const updatedSocialMedia = await social.save(); // Save the instance correctly
        res.json(updatedSocialMedia);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
