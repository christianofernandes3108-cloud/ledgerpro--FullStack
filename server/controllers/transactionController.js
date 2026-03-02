const transactionModel = require("../models/transactionModel");
const pool = require("../config/db");

/*
Handles business logic + validation
*/

// Create transaction
const createTransaction = async (req, res) => {
  try {
    const userId = req.user;
    const { type, amount, category_id, description, date } = req.body;

    if (!type || !amount || !category_id || !date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    // Verify category belongs to user
    const categoryCheck = await pool.query(
      `
      SELECT * FROM ledger_categories
      WHERE id = $1 AND user_id = $2
      `,
      [category_id, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Ensure category type matches transaction type
    if (categoryCheck.rows[0].type !== type) {
      return res.status(400).json({
        message: "Transaction type does not match category type",
      });
    }

    const transaction = await transactionModel.createTransaction(
      userId,
      type,
      amount,
      category_id,
      description,
      date
    );

    res.status(201).json(transaction);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user;

    const { type, category_id, startDate, endDate } = req.query;

    const transactions = await transactionModel.getTransactions(
      userId,
      type,
      category_id,
      startDate,
      endDate
    );

    res.json(transactions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const deleted = await transactionModel.deleteTransaction(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
};