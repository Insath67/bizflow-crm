const express = require("express");
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createItem);
router.get("/", protect, getItems);
router.get("/:id", protect, getItemById);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

module.exports = router;