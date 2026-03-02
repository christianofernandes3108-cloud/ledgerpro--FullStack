const pool = require("../config/db");

/*
This file handles ONLY database queries
for the categories table.
*/

// Create category
const createCategory = async (userId, name, type) => {
  const result = await pool.query(
    `
    INSERT INTO ledger_categories (user_id, name, type)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [userId, name, type]
  );

  return result.rows[0];
};

// Get all categories for a specific user
const getCategoriesByUser = async (userId) => {
  const result = await pool.query(
    `
    SELECT * FROM ledger_categories
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

// Delete category (only if owned by user)
const deleteCategory = async (categoryId, userId) => {
  const result = await pool.query(
    `
    DELETE FROM ledger_categories
    WHERE id = $1 AND user_id = $2
    RETURNING *
    `,
    [categoryId, userId]
  );

  return result.rows[0];
};

module.exports = {
  createCategory,
  getCategoriesByUser,
  deleteCategory,
};