const Category = require('../models/Category');
const Product = require('../models/Product');

// ==========================================
// PUBLIC / USER ENDPOINTS
// ==========================================

// @desc    Get all categories and subcategories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategoryId', 'name');
    res.json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve categories' });
  }
};

// @desc    Get all products with pagination, filtering, search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { categoryId, subCategoryId, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (subCategoryId) {
      query.subCategoryId = subCategoryId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const skipIndex = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .skip(skipIndex)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      status: 'success',
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve products' });
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name');

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve product details' });
  }
};

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin only)
const createProduct = async (req, res) => {
  const { name, code, images, catalogPdf, specifications, categoryId, subCategoryId } = req.body;
  const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

  try {
    // Check code unique
    const codeExists = await Product.findOne({ code });
    if (codeExists) {
      return res.status(400).json({ status: 'error', message: `Product code ${code} is already in use` });
    }

    // Check category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ status: 'error', message: 'Category not found' });
    }

    // Handle uploaded files
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    }
    // Also accept URLs passed in body (for backward compatibility)
    if (req.body.images) {
      const bodyImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
      if (Array.isArray(bodyImages)) {
        imageUrls = [...imageUrls, ...bodyImages];
      }
    }

    const product = await Product.create({
      name,
      code,
      images: imageUrls,
      catalogPdf,
      specifications: parsedSpecs || {},
      categoryId,
      subCategoryId: subCategoryId || null,
    });

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create product' });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
  const { name, code, images, catalogPdf, specifications, categoryId, subCategoryId } = req.body;
  const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    if (code && code !== product.code) {
      const codeExists = await Product.findOne({ code });
      if (codeExists) {
        return res.status(400).json({ status: 'error', message: `Product code ${code} is already in use` });
      }
      product.code = code;
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ status: 'error', message: 'Category not found' });
      }
      product.categoryId = categoryId;
    }

    if (name) product.name = name;

    let imageUrls = [];
    // Keep existing images if specified
    if (req.body.existingImages) {
      const existing = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
      if (Array.isArray(existing)) {
        imageUrls = [...existing];
      }
    }
    // Add newly uploaded files
    if (req.files && req.files.length > 0) {
      const newUploads = req.files.map(file => `/uploads/products/${file.filename}`);
      imageUrls = [...imageUrls, ...newUploads];
    }
    if (imageUrls.length > 0 || req.files) {
      product.images = imageUrls;
    }

    if (catalogPdf !== undefined) product.catalogPdf = catalogPdf;
    if (parsedSpecs) product.specifications = parsedSpecs;
    product.subCategoryId = subCategoryId !== undefined ? subCategoryId : product.subCategoryId;

    await product.save();

    res.json({
      status: 'success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete product' });
  }
};

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
  const { name, parentCategoryId } = req.body;

  try {
    if (parentCategoryId) {
      const parentExists = await Category.findById(parentCategoryId);
      if (!parentExists) {
        return res.status(400).json({ status: 'error', message: 'Parent category not found' });
      }
    }

    const category = await Category.create({
      name,
      parentCategoryId: parentCategoryId || null,
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create category' });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
  const { name, parentCategoryId } = req.body;

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    if (parentCategoryId) {
      if (parentCategoryId === category._id.toString()) {
        return res.status(400).json({ status: 'error', message: 'Category cannot be its own parent' });
      }
      const parentExists = await Category.findById(parentCategoryId);
      if (!parentExists) {
        return res.status(400).json({ status: 'error', message: 'Parent category not found' });
      }
      category.parentCategoryId = parentCategoryId;
    } else if (parentCategoryId === null) {
      category.parentCategoryId = null;
    }

    if (name) category.name = name;

    await category.save();

    res.json({
      status: 'success',
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update category' });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    // Check if category is used in products
    const productsUsing = await Product.findOne({
      $or: [{ categoryId: req.params.id }, { subCategoryId: req.params.id }],
    });

    if (productsUsing) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category. It is associated with one or more products.',
      });
    }

    // Check if category is parent to subcategories
    const hasSubcategories = await Category.findOne({ parentCategoryId: req.params.id });
    if (hasSubcategories) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category. It has subcategories mapped under it.',
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    res.json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
};
