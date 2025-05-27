const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/database.js");
const cors = require("cors");
const userRoutes = require("./routes/auth.routes.js");
const categoryRoutes = require("./routes/category.routes.js");
const bannerRoutes = require("./routes/banner.routes.js");
const productRoutes = require("./routes/product.routes.js");
const teamRoutes = require("./routes/team.routes.js");
const investorRoutes = require("./routes/investor.routes.js");
const newsletterRoutes = require("./routes/newsletter.routes.js");
const settingsRoutes = require("./routes/settings.routes.js");
const securityRoutes = require("./routes/security.routes.js");
const offersRoutes = require("./routes/offers.routes.js");
const mediaRoutes = require("./routes/media.routes.js");
const apiSettingsRoutes = require("./routes/apiSettings.routes.js");
const partnerRoutes = require("./routes/partner.routes.js");
const hiwRoutes = require("./routes/HIW.routes.js");
const faqRoutes = require("./routes/faq.routes.js");
const teamMemberRoutes = require("./routes/teamMember.routes.js");
const beOurPartnerRoutes = require("./routes/beOurPartner.routes.js");
const jobOpeningRoutes = require("./routes/jobOpenings.routes.js");
const path = require("path");
const contactUsRoutes = require("./routes/contactUs.routes.js");
const socialMediaRoutes = require("./routes/SocialMedia.routes.js");
const testimonialRoutes = require("./routes/testimonial.routes.js");
const storeLocationRoutes = require("./routes/storeLocation.routes.js");
const registrationRoutes = require("./routes/registration.routes.js");
const applicationRoutes = require("./routes/application.routes.js");
const goldRateRoutes = require("./routes/goldrate.routes.js"); // <-- Added this import
const loanFormRoutes = require("./routes/loanForm.routes.js")
const partnerFormRoutes = require("./routes/partnerForm.routes.js")
const referralRoutes = require("./routes/referral.routes.js")
const leadRoutes = require('./routes/lead.routes.js');
const pincodeRoutes = require('./routes/pincode.routes.js');



dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route definitions
app.use("/api/auth", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api", bannerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/investor-desk", investorRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/api-settings", apiSettingsRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/hiws", hiwRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/be-our-partner", beOurPartnerRoutes);
app.use("/api/job-openings", jobOpeningRoutes);
app.use("/api/contact-us", contactUsRoutes);
app.use("/api/social", socialMediaRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/store-locations", storeLocationRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/lead",leadRoutes);
app.use('/api/pincode', pincodeRoutes);

// ** Add Gold Rate Routes **
app.use("/api/goldrate", goldRateRoutes); // <-- Added this line

/*
onsite refactoring
*/

app.use("/api/loan-form", loanFormRoutes)
app.use("/api/partner-form", partnerFormRoutes)
app.use("/api/referrals", referralRoutes)


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something broke!",
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get("/health", (req, res) => {
    res.json({ message: "server healthy" });
});

module.exports = app;
