const express = require("express");
const {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  reviewProduct,
  deleteReview,
  updateRevien,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, adminOnly, createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id", protect, adminOnly, updateProduct);

router.patch("/review/:id", protect, reviewProduct);
router.patch("/deletereview/:id", protect, deleteReview);
router.patch("/updatereview/:id", protect, updateRevien);

module.exports = router;
