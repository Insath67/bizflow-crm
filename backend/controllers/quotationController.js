const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");

const generateQuotationNumber = async () => {
  const count = await Quotation.countDocuments();
  const nextNumber = count + 1;
  return `QTN-${String(nextNumber).padStart(5, "0")}`;
};

const calculateTotals = (items, discount = 0, tax = 0) => {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const total = quantity * price;

    return {
      ...item,
      quantity,
      price,
      total,
    };
  });

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = subtotal - Number(discount) + Number(tax);

  return {
    calculatedItems,
    subtotal,
    grandTotal,
  };
};

const createQuotation = async (req, res) => {
  try {
    const {
      customer,
      items,
      discount,
      tax,
      validUntil,
      status,
      notes,
    } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer and quotation items are required",
      });
    }

    const existingCustomer = await Customer.findOne({
      _id: customer,
      createdBy: req.user._id,
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const { calculatedItems, subtotal, grandTotal } = calculateTotals(
      items,
      discount,
      tax
    );

    const quotationNumber = await generateQuotationNumber();

    const quotation = await Quotation.create({
      quotationNumber,
      customer,
      items: calculatedItems,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      grandTotal,
      validUntil,
      status,
      notes,
      createdBy: req.user._id,
    });

    const populatedQuotation = await Quotation.findById(quotation._id).populate(
      "customer",
      "name email phone company address"
    );

    res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: populatedQuotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create quotation",
      error: error.message,
    });
  }
};

const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ createdBy: req.user._id })
      .populate("customer", "name email phone company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("customer", "name email phone company address");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotation",
      error: error.message,
    });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.items) {
      const { calculatedItems, subtotal, grandTotal } = calculateTotals(
        req.body.items,
        req.body.discount || 0,
        req.body.tax || 0
      );

      updateData.items = calculatedItems;
      updateData.subtotal = subtotal;
      updateData.grandTotal = grandTotal;
    }

    const quotation = await Quotation.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("customer", "name email phone company address");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: error.message,
    });
  }
};

const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};