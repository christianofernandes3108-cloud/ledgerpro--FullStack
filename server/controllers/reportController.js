const pool = require("../config/db");

/*
Handles reporting logic.
These are calculated responses.
Not simple CRUD.
*/

// 1️.Monthly Summary
const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month parameter required (YYYY-MM)" });
    }

    const result = await pool.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expenses
      FROM transactions
      WHERE user_id = $1
        AND DATE_TRUNC('month', date) = DATE_TRUNC('month', $2::date)
      `,
      [userId, `${month}-01`]
    );

    const totalIncome = Number(result.rows[0].total_income);
    const totalExpenses = Number(result.rows[0].total_expenses);
    const netBalance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      netBalance,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️. Category Breakdown
const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month parameter required (YYYY-MM)" });
    }

    const result = await pool.query(
      `
      SELECT c.name AS category,
             SUM(t.amount) AS total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
        AND t.type = 'expense'
        AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', $2::date)
      GROUP BY c.name
      ORDER BY total DESC
      `,
      [userId, `${month}-01`]
    );

    const formatted = result.rows.map(row => ({
      category: row.category,
      total: Number(row.total),
    }));

    res.json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️. Running Balance
const getRunningBalance = async (req, res) => {
  try {
    const userId = req.user;

    const result = await pool.query(
      `
      SELECT date, type, amount
      FROM transactions
      WHERE user_id = $1
      ORDER BY date ASC
      `,
      [userId]
    );

    let balance = 0;

    const running = result.rows.map(tx => {
      if (tx.type === "income") {
        balance += Number(tx.amount);
      } else {
        balance -= Number(tx.amount);
      }

      return {
        date: tx.date,
        type: tx.type,
        amount: Number(tx.amount),
        balance,
      };
    });

    res.json(running);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMonthlySummary,
  getCategoryBreakdown,
  getRunningBalance,
};