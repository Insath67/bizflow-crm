const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Quotation = require("../models/Quotation");

const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const nextNumber = count + 1;
  return `INV-${String(nextNumber).padStart(5, "0")}`;
};

const calculateInvoiceTotals = (
  items,
  discount = 0,
  tax = 0,
  amountPaid = 0
) => {
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
  const balanceDue = grandTotal - Number(amountPaid);

  let status = "sent";

  if (Number(amountPaid) <= 0) {
    status = "sent";
  } else if (Number(amountPaid) < grandTotal) {
    status = "partial";
  } else {
    status = "paid";
  }

  return {
    calculatedItems,
    subtotal,
    grandTotal,
    balanceDue,
    status,
  };
};

const createInvoice = async (req, res) => {
  try {
    const {
      customer,
      quotation,
      items,
      discount,
      tax,
      amountPaid,
      dueDate,
      status,
      notes,
    } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer and invoice items are required",
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

    if (quotation) {
      const existingQuotation = await Quotation.findOne({
        _id: quotation,
        createdBy: req.user._id,
      });

      if (!existingQuotation) {
        return res.status(404).json({
          success: false,
          message: "Quotation not found",
        });
      }
    }

    const {
      calculatedItems,
      subtotal,
      grandTotal,
      balanceDue,
      status: calculatedStatus,
    } = calculateInvoiceTotals(items, discount, tax, amountPaid);

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      quotation,
      items: calculatedItems,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      grandTotal,
      amountPaid: amountPaid || 0,
      balanceDue,
      dueDate,
      status: status || calculatedStatus,
      notes,
      createdBy: req.user._id,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("customer", "name email phone company address")
      .populate("quotation", "quotationNumber");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: populatedInvoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user._id })
      .populate("customer", "name email phone company")
      .populate("quotation", "quotationNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate("customer", "name email phone company address")
      .populate("quotation", "quotationNumber");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.items) {
      const {
        calculatedItems,
        subtotal,
        grandTotal,
        balanceDue,
        status,
      } = calculateInvoiceTotals(
        req.body.items,
        req.body.discount || 0,
        req.body.tax || 0,
        req.body.amountPaid || 0
      );

      updateData.items = calculatedItems;
      updateData.subtotal = subtotal;
      updateData.grandTotal = grandTotal;
      updateData.balanceDue = balanceDue;
      updateData.status = req.body.status || status;
    }

    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name email phone company address")
      .populate("quotation", "quotationNumber");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};