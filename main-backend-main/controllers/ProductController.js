// controllers/productController.js
const Product = require('../models/Product');
const Gallery = require('../models/Gallery'); // Assumed Gallery model
const upload = require('../utils/FileUpload');
// Helper function to create a gallery record for an uploaded file
/**
 * GET /api/products
 * Public endpoint to fetch all products with complete sections.
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('icon')
      .populate('quickstepsSection.image')
      .populate('quickstepsSection.steps.icon');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/products/:id
 * Public endpoint to fetch a single product by ID (with complete sections).
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('icon')
      .populate('quickstepsSection.image')
      .populate('quickstepsSection.steps.icon');
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/products/:id/sections
 * Public endpoint to fetch only the sections content for a product.
 */
exports.getProductSections = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('quickstepsSection.image')
      .populate('quickstepsSection.steps.icon');
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    const sections = {
      mainSection: product.mainSection,
      quickstepsSection: product.quickstepsSection,
      benefitsSection: product.benefitsSection
    };
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/products
 * Admin endpoint to create a new product with core fields.
 * Expects multipart/form-data with:
 *  - text fields: title, description, seo (as JSON or normal fields)
 *  - file field: "iconFile" for the product icon.
 */
exports.createProduct = [
  upload.single('iconFile'),
   async (req, res) => {
    try {
      // (Assume req.user is set by your JWT middleware if needed)
      const { title, description,category, seo } = req.body;
      console.log(req.body);
      console.log("category", category);
      // Parse SEO data if provided as a string.
      const seoData = seo ? (typeof seo === "string" ? JSON.parse(seo) : seo) : {};
      
      let productData = {
        title,
        description,
        category,
        seo: seoData
      };
  
      // Process the icon file if uploaded.
      if (req.file) {
        // req.file.location is provided by multer-s3
        productData.icon = req.file.location;
      } else if (req.body.icon) {
        // Use the provided icon value if it is a valid URL.
        productData.icon = req.body.icon;
      } else {
        return res.status(400).json({
          success: false,
          message: "Icon file is required."
        });
      }
      
      const product = await Product.create(productData);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating product",
        error: error.message
      });
    }
  }
];

exports.updateProduct = [
  upload.single('iconFile'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
  
      const { title, description,category, seo } = req.body;
      if (title) product.title = title;
      if (description) product.description = description;
      if (category) product.category = category;
  
      if (seo) {
        let seoData;
        // If seo is a string, parse it; otherwise, assume it's an object.
        if (typeof seo === "string") {
          seoData = JSON.parse(seo);
        } else {
          seoData = seo;
        }
        // Ensure metaKeywords is stored as a string.
        if (Array.isArray(seoData.metaKeywords)) {
          seoData.metaKeywords = seoData.metaKeywords.join(", ");
        } else if (typeof seoData.metaKeywords !== "string") {
          seoData.metaKeywords = "";
        }
        // Update the product's seo field (merging with existing data if needed)
        product.seo = { ...product.seo, ...seoData };
      }
  
      // If a new icon file is uploaded, update the icon field with its S3 URL.
      if (req.file) {
        product.icon = req.file.location;
      } else if (req.body.icon) {
        product.icon = req.body.icon;
      }
  
      const updatedProduct = await product.save();
      res.json({ success: true, data: updatedProduct });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message
      });
    }
  }
];

/**
 * PUT /api/products/:id/sections
 * Admin endpoint to update all sections for a product.
 * Expects multipart/form-data with:
 *  - text fields: "mainSection", "quickstepsSection", "benefitsSection" (as JSON strings or already parsed)
 *  - file field "quickstepsSectionImage" for quickstepsSection.image
 *  - file field(s) "qickstepIcon" for each quickstep's icon (order corresponds to the steps order)
 */
exports.updateProductSections = [
  upload.any(), // Accept any files and then filter by fieldname
  async (req, res) => {
    try {
      // Parse JSON fields if necessary.
      let mainSection = req.body.mainSection;
      let quickstepsSection = req.body.quickstepsSection;
      let benefitsSection = req.body.benefitsSection;
      
      if (typeof mainSection === "string") {
        mainSection = JSON.parse(mainSection);
      }
      if (typeof quickstepsSection === "string") {
        quickstepsSection = JSON.parse(quickstepsSection);
      }
      if (typeof benefitsSection === "string") {
        benefitsSection = JSON.parse(benefitsSection);
      }
  
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
  
      // Update mainSection as provided.
      if (mainSection !== undefined) {
        product.mainSection = mainSection;
      }
  
      // --- Process Quicksteps Section ---
  
      // Filter the files by field name
      const quickstepsSectionImageFiles = req.files.filter(
        (file) => file.fieldname === "quickstepsSectionImage"
      );
      const quickstepIconFiles = req.files.filter(
        (file) => file.fieldname === "quickstepIcon"
      );
  
      if (quickstepsSection !== undefined) {
        // If a new quickstepsSection image file is uploaded, update it;
        // otherwise, preserve the existing image.
        if (quickstepsSectionImageFiles.length > 0) {
          quickstepsSection.image = quickstepsSectionImageFiles[0].location;
        } else {
          quickstepsSection.image = product.quickstepsSection.image;
        }
  
        // Update each step’s icon:
        // Loop through the steps array and, if there’s a corresponding uploaded file,
        // set the step’s icon to that file’s S3 URL.
        if (quickstepsSection.steps && Array.isArray(quickstepsSection.steps)) {
          quickstepsSection.steps = quickstepsSection.steps.map((step, index) => {
            // Look for a quickstepIcon file that belongs to this step.
            // (Assuming the frontend sends one file per step in order.)
            if (quickstepIconFiles[index]) {
              return { ...step, icon: quickstepIconFiles[index].location };
            } else if (
              product.quickstepsSection.steps &&
              product.quickstepsSection.steps[index] &&
              product.quickstepsSection.steps[index].icon
            ) {
              // If no new file for this step, preserve the existing icon.
              return { ...step, icon: product.quickstepsSection.steps[index].icon };
            } else {
              return step;
            }
          });
        }
  
        product.quickstepsSection = quickstepsSection;
      }
  
      // --- Process Benefits Section ---
      if (benefitsSection !== undefined) {
        product.benefitsSection = benefitsSection;
      }
  
      const updatedProduct = await product.save();
      res.json({
        success: true,
        mainSection: updatedProduct.mainSection,
        quickstepsSection: updatedProduct.quickstepsSection,
        benefitsSection: updatedProduct.benefitsSection
      });
    } catch (error) {
      console.error("Error updating product sections:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
];
/**
 * DELETE /api/products/:id
 * Admin endpoint to delete a product.
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    
    // Use deleteOne() on the retrieved document
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};