const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createCtagory,
  getCategories,
  deleteCategories,
  deleteCategory,
} = require("../controllers/categoryController");
const router = express.Router();

// Routes
router.post("/createCategory", protect, adminOnly, createCtagory);
router.get("/getCategories", protect, adminOnly, getCategories);
router.delete("/:slug", protect, adminOnly, deleteCategory);

module.exports = router;
