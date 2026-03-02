// Import database pool
const pool = require("../config/db");

/*
This file handles ONLY database logic.
No business logic.
No request/response handling.
*/

// Create new user
const createUser = async (name, email, hashedPassword) => {
  const result = await pool.query(
    `
    INSERT INTO ledger_users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
    `,
    [name, email, hashedPassword]
  );

  return result.rows[0];
};

// Find user by email (used for login)
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT * FROM ledger_users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
};

// Export functions
module.exports = {
  createUser,
  findUserByEmail,
};