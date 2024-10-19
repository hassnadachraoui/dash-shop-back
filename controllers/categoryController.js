const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const slugify = require("slugify");

const createCtagory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Please fill in category name");
  }

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category name already exists.");
  }

  const category = await Category.create({
    name,
    slug: slugify(name),
  });
  res.status(201).json(category);
});

// Get Category
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort("-createdAt");
  res.status(201).json(categories);
});

// Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const category = await Category.findOneAndDelete({slug});

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }
  res.status(200).json({ message: "Category Deleted." });
});

module.exports = {
  createCtagory,
  getCategories,
  deleteCategory,
};
