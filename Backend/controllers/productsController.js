import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
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

    // Create notifications for users who might be interested (you can add logic here)
    // For now, we'll just update the seller's badge
    const seller = await User.findById(req.user._id);
    if (seller) {
      seller.totalPosts += 1;
      const oldBadge = seller.badge;
      seller.updateBadge();
      await seller.save();

      // Create badge notification if badge changed
      if (seller.badge !== oldBadge && seller.badge !== 'none') {
        const Notification = (await import('../models/Notification.js')).default;
        await Notification.create({
          user: seller._id,
          type: 'badge',
          title: 'New Badge Earned!',
          message: `Congratulations! You've earned the ${seller.badge} seller badge!`,
          relatedId: seller._id,
          relatedType: 'User'
        });
      }
    }

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { q, category, school, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category && category !== 'all') filter.category = category;
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    // Build query with school filter
    let query = Product.find(filter);
    
    if (school && school !== 'all') {
      query = query.populate({
        path: 'seller',
        match: { school: school },
        select: 'username email badge profilePic school'
      });
    } else {
      query = query.populate('seller', 'username email badge profilePic school');
    }
    
    const products = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Filter out products where seller doesn't match school filter
    const filteredProducts = school && school !== 'all' 
      ? products.filter(p => p.seller && p.seller.school === school)
      : products;

    // Convert local file paths to URLs
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const productsWithUrls = filteredProducts.map(product => {
      if (product.images && Array.isArray(product.images)) {
        product.images = product.images.map(img => {
          if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
            // Convert local path to URL
            if (img.startsWith('/uploads/') || img.startsWith('uploads/')) {
              return `${baseURL}${img.startsWith('/') ? '' : '/'}${img}`;
            }
            // If it's a full path, extract filename
            const filename = img.split(/[/\\]/).pop();
            return `${baseURL}/uploads/${filename}`;
          }
          return img;
        });
      }
      return product;
    });

    const total = await Product.countDocuments(filter);
    return res.status(200).json({ products: productsWithUrls, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findById(id).populate('seller', 'username email badge profilePic');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.views = (product.views || 0) + 1;
    await product.save();
    
    // Convert local file paths to URLs
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    if (product.images && Array.isArray(product.images)) {
      product.images = product.images.map(img => {
        if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
          if (img.startsWith('/uploads/') || img.startsWith('uploads/')) {
            return `${baseURL}${img.startsWith('/') ? '' : '/'}${img}`;
          }
          const filename = img.split(/[/\\]/).pop();
          return `${baseURL}/uploads/${filename}`;
        }
        return img;
      });
    }
    
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