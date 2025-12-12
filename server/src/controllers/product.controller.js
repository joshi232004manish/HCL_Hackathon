import { errorHandler } from "../utils/error.js";
import Product from "../models/productmodel.js";
import User from "../models/usermodel.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs/promises";
import express from "express";

// Create Product (Admin Only)
export const createProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user); // ✅ fetch from DB
    if (!user || !user.isadmin) {
      return next(errorHandler(403, "Only admins can create products"));
    }
    

    const {
      title,
      description,
      includes,
      price,
      category,
      stock,
      discount,
      imageUrls,
      isLaunchingSoon,
    } = req.body;

    const product = await Product.create({
      title,
      description,
      includes,
      price,
      category,
      stock,
      discount,
      imageUrls,
      isLaunchingSoon: isLaunchingSoon === true || isLaunchingSoon === "true", // ✅ coerce to boolean
    });

    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};


// Get Single Product
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(errorHandler(404, "Product not found"));
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Get All Products (Optional: Admin Only or Public)
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// Upload Image (Admin Only)
export const uploadImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user || !user.isadmin) {
      return next(errorHandler(403, "Only admins can upload images"));
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Directly return the secure URLs from Cloudinary
    const imageUrls = req.files.map((file) => file.path); // `file.path` is actually the Cloudinary URL
    console.log("✅ Uploaded images:", imageUrls);

    return res.status(200).json({ imageUrls });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};



// product update by admin
export const updateProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user || !user.isadmin) {
      return next(errorHandler(403, "Only admins can update products"));
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return next(errorHandler(404, "Product not found"));
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};
// Delete Product (Admin Only)
export const deleteProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user || !user.isadmin) {
      return next(errorHandler(403, "Only admins can delete products"));
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(errorHandler(404, "Product not found"));

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

