const express = require("express");
const {
  getCompany,
  updateCompany,
} = require("../controllers/companyController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCompany);
router.put("/", protect, updateCompany);

module.exports = router;