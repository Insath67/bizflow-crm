const Item = require("../models/Item");

const createItem = async (req, res) => {
  try {
    const {
      name,
      type,
      category,
      description,
      price,
      stockQuantity,
      unit,
      status,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Item name and price are required",
      });
    }

    const item = await Item.create({
      name,
      type,
      category,
      description,
      price,
      stockQuantity,
      unit,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create item",
      error: error.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await Item.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
      error: error.message,
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch item",
      error: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update item",
      error: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};