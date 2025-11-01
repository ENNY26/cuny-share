import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { getFileUrl, getFileKey, getFileType } from './helpers.js';

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, location } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const files = req.files || [];
    const images = files.map(getFileUrl).filter(Boolean);
    const imageKeys = files.map(getFileKey);
    const fileTypes = files.map((f) => getFileType(f.mimetype || f.originalname || ''));

    const newProduct = new Product({
      title,
      description,
      price: price ? Number(price) : 0,
      category: category || 'general',
      condition: condition || 'used',
      location,
      images,
      imageKeys,
      fileTypes,
      seller: req.user?._id,
      sellerUsername: req.user?.username,
      sellerEmail: req.user?.email
    });

    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category && category !== 'all') filter.category = category;
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const products = await Product.find(filter)
      .populate('seller', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);
    return res.status(200).json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findById(id).populate('seller', 'username email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.views = (product.views || 0) + 1;
    await product.save();
    return res.status(200).json(product);
  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ message: 'Failed to get product', error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (String(product.seller) !== String(req.user?._id)) return res.status(403).json({ message: 'Not the owner' });

    const files = req.files || [];
    if (files.length) {
      const images = files.map(getFileUrl).filter(Boolean);
      const imageKeys = files.map(getFileKey);
      product.images = product.images.concat(images);
      product.imageKeys = product.imageKeys.concat(imageKeys);
      product.fileTypes = product.fileTypes.concat(files.map((f) => getFileType(f.mimetype || f.originalname || '')));
    }

    const updatable = ['title', 'description', 'price', 'category', 'condition', 'location', 'isAvailable'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) product[k] = req.body[k];
    });
    product.updatedAt = new Date();
    await product.save();
    return res.status(200).json(product);
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (String(product.seller) !== String(req.user?._id)) return res.status(403).json({ message: 'Not the owner' });

    // TODO: remove files from storage using imageKeys (S3/disk) if desired
    await product.deleteOne();
    return res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

export const likeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const liked = product.likes.some((l) => String(l) === String(userId));
    if (liked) product.likes = product.likes.filter((l) => String(l) !== String(userId));
    else product.likes.push(userId);
    await product.save();
    return res.status(200).json({ likes: product.likes.length, liked: !liked });
  } catch (err) {
    console.error('likeProduct error:', err);
    return res.status(500).json({ message: 'Failed to like product', error: err.message });
  }
};

export const saveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const saved = product.saves.some((s) => String(s) === String(userId));
    if (saved) product.saves = product.saves.filter((s) => String(s) !== String(userId));
    else product.saves.push(userId);
    await product.save();
    return res.status(200).json({ saved: !saved });
  } catch (err) {
    console.error('saveProduct error:', err);
    return res.status(500).json({ message: 'Failed to save product', error: err.message });
  }
};