const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { default: mongoose } = require("mongoose");

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    category,
    brand,
    quantity,
    description,
    image,
    regularPrice,
    price,
    color,
  } = req.body;

  if (!name || !category || !brand || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Create Product

  const product = await Product.create({
    name,
    sku,
    category,
    brand,
    quantity,
    description,
    image,
    regularPrice,
    price,
    color,
  });

  res.status(201).json(product);
});

// Get Products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("-createdAt");
  res.status(201).json(products);
});

// Get single Products
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }
  res.status(201).json(product);
});

//Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }
  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Product Deleted." });
});

// Update Product

const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    brand,
    quantity,
    description,
    image,
    regularPrice,
    price,
    color,
  } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  // Update Product
  const updateProduct = await Product.findByIdAndUpdate(
    {
      _id: req.params.id,
    },
    {
      name,
      category,
      brand,
      quantity,
      description,
      image,
      regularPrice,
      price,
      color,
    },
    {
      new: true,
      runValidation: true,
    }
  );

  res.status(200).json(updateProduct);
});

// Review Product
const reviewProduct = asyncHandler(async (req, res) => {
  const { star, review, reviewDate } = req.body;
  const { id } = req.params;

  // Validation
  if (star < 1 || !review) {
    res.status(400);
    throw new Error("Please add a star and review");
  }

  const product = await Product.findById(id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  // Update Rating
  product.ratings.push({
    star,
    review,
    reviewDate,
    name: req.user.name,
    userID: req.user._id,
  });

  product.save();
  res.status(200).json({ message: "Product review added." });
});

//Delete Review
const deleteReview = asyncHandler(async (req, res) => {
  const { userID } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  const newRatings = product.ratings.filter((rating) => {
    return rating.userID.toString() !== userID.toString();
  });

  product.ratings = newRatings;
  product.save();
  res.status(200).json({ message: "Product review deleted." });
});

//Update Review
const updateRevien = asyncHandler(async (req, res) => {
  const { star, review, reviewDate, userID } = req.body;
  const { id } = req.params;

  // Validation
  if (star < 1 || !review) {
    res.status(400);
    throw new Error("Please add a star and review");
  }

  const product = await Product.findById(id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  // Match user to review
  if (req.user._id.toString() !== userID) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Update product review
  const updatedReview = await Product.findOneAndUpdate(
    {
      _id: product._id,
      "ratings.userID": mongoose.Types.ObjectId(userID),
    },
    {
      $set: {
        "ratings.$.star": star,
        "ratings.$.review": review,
        "ratings.$.reviewDate": reviewDate,
      },
    }
  );

  if (updatedReview) {
    res.status(200).json({ message: "Product review updated." });
  } else {
    res.status(400).json({ message: "Product review NOT updated." });
  }
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  reviewProduct,
  deleteReview,
  updateRevien,
};
