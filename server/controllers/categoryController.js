const categoryModel = require("../models/categoryModel");

/*
Handles business logic + validation
*/

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user; // comes from JWT middleware

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type required" });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "Invalid category type" });
    }

    const category = await categoryModel.createCategory(
      userId,
      name,
      type
    );

    res.status(201).json(category);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const userId = req.user;

    const categories = await categoryModel.getCategoriesByUser(userId);

    res.json(categories);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const deleted = await categoryModel.deleteCategory(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
};