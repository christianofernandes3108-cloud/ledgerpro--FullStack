// Import PostgreSQL library
const { Pool } = require("pg");

// Load environment variables from .env file
require("dotenv").config();

/*
Pool creates a connection pool.
This is more efficient than opening
a new connection for every request.
*/
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export the pool so other files can use it
module.exports = pool;