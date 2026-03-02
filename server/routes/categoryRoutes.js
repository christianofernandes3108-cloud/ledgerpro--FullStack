const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  createCategory,
  getCategories,
  deleteCategory,
} = require("../controllers/categoryController");

// Protect all routes below
router.use(protect);

// Create category
router.post("/", createCategory);

// Get all categories
router.get("/", getCategories);

// Delete category
router.delete("/:id", deleteCategory);

module.exports = router;