const express = require("express");
const {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} = require("../controllers/quotationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createQuotation);
router.get("/", protect, getQuotations);
router.get("/:id", protect, getQuotationById);
router.put("/:id", protect, updateQuotation);
router.delete("/:id", protect, deleteQuotation);

module.exports = router;