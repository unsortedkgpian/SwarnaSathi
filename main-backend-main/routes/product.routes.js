const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const upload = require('../utils/FileUpload'); // our multer-s3 config
const {protect,authorize} = require('../middlewares/auth');
// Public endpoints
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/sections', productController.getProductSections);

// Admin endpoints (protected with JWT)
// Create product (with file upload for product icon)
router.post('/',productController.createProduct);

router.put("/:id", protect, productController.updateProduct);
// Update product sections (with file uploads for quicksteps image and icons)
router.put('/:id/sections', protect,  productController.updateProductSections);

// Delete product
router.delete('/:id',protect,  productController.deleteProduct);

module.exports = router;