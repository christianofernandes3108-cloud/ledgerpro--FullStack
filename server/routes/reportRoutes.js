const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  getMonthlySummary,
  getCategoryBreakdown,
  getRunningBalance,
} = require("../controllers/reportController");

router.use(protect);

router.get("/monthly", getMonthlySummary);
router.get("/category-breakdown", getCategoryBreakdown);
router.get("/running-balance", getRunningBalance);

module.exports = router;