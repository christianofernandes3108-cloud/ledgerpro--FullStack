const pool = require("../config/db");

/*
Handles ONLY database queries
for transactions table
*/

// Create transaction
const createTransaction = async (
  userId,
  type,
  amount,
  categoryId,
  description,
  date
) => {
  const result = await pool.query(
    `
    INSERT INTO transactions 
    (user_id, type, amount, category_id, description, date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [userId, type, amount, categoryId, description, date]
  );

  return result.rows[0];
};

// Get transactions with optional filters
const getTransactions = async (
  userId,
  type,
  categoryId,
  startDate,
  endDate
) => {

  let query = `
    SELECT t.*, c.name AS category_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1
  `;

  const values = [userId];
  let index = 2;

  if (type) {
    query += ` AND t.type = $${index}`;
    values.push(type);
    index++;
  }

  if (categoryId) {
    query += ` AND t.category_id = $${index}`;
    values.push(categoryId);
    index++;
  }

  if (startDate && endDate) {
    query += ` AND t.date BETWEEN $${index} AND $${index + 1}`;
    values.push(startDate, endDate);
    index += 2;
  }

  query += ` ORDER BY t.date DESC`;

  const result = await pool.query(query, values);

  return result.rows;
};

// Delete transaction
const deleteTransaction = async (transactionId, userId) => {
  const result = await pool.query(
    `
    DELETE FROM transactions
    WHERE id = $1 AND user_id = $2
    RETURNING *
    `,
    [transactionId, userId]
  );

  return result.rows[0];
};

module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
};