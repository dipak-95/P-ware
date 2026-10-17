const express = require('express');
const {
  getCategories,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/catalogController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public Routes
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Admin Restricted Catalog Routes
const upload = require('../middleware/upload');

router.post('/admin/products', protect, requireRole(['admin']), upload.array('images', 5), createProduct);
router.put('/admin/products/:id', protect, requireRole(['admin']), upload.array('images', 5), updateProduct);
router.delete('/admin/products/:id', protect, requireRole(['admin']), deleteProduct);

router.post('/admin/categories', protect, requireRole(['admin']), createCategory);
router.put('/admin/categories/:id', protect, requireRole(['admin']), updateCategory);
router.delete('/admin/categories/:id', protect, requireRole(['admin']), deleteCategory);

module.exports = router;
