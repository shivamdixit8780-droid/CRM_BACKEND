const Product = require('../models/Product');

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;

    const product = await Product.create({ name, price, category, description, stock });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products — stock sirf admin ko dikhega
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // agar admin nahi hai, to stock field response se hata do
    const result = products.map((p) => {
      const productObj = p.toObject();
      if (req.user.role !== 'admin') {
        delete productObj.stock;
      }
      return productObj;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product — stock sirf admin ko dikhega
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productObj = product.toObject();
    if (req.user.role !== 'admin') {
      delete productObj.stock;
    }

    res.status(200).json(productObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};