const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

const generatePaymentNumber = async () => {
  const count = await Payment.countDocuments();
  const nextNumber = count + 1;
  return `PAY-${String(nextNumber).padStart(5, "0")}`;
};

const updateInvoicePaymentStatus = async (invoice) => {
  const totalPaid = await Payment.aggregate([
    {
      $match: {
        invoice: invoice._id,
      },
    },
    {
      $group: {
        _id: "$invoice",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const amountPaid = totalPaid.length > 0 ? totalPaid[0].totalAmount : 0;
  const balanceDue = invoice.grandTotal - amountPaid;

  let status = "sent";

  if (amountPaid <= 0) {
    status = "sent";
  } else if (amountPaid < invoice.grandTotal) {
    status = "partial";
  } else {
    status = "paid";
  }

  invoice.amountPaid = amountPaid;
  invoice.balanceDue = balanceDue < 0 ? 0 : balanceDue;
  invoice.status = status;

  await invoice.save();

  return invoice;
};

const createPayment = async (req, res) => {
  try {
    const {
      invoice,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    if (!invoice || !amount) {
      return res.status(400).json({
        success: false,
        message: "Invoice and payment amount are required",
      });
    }

    const existingInvoice = await Invoice.findOne({
      _id: invoice,
      createdBy: req.user._id,
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (Number(amount) > existingInvoice.balanceDue) {
      return res.status(400).json({
        success: false,
        message: "Payment amount cannot be greater than balance due",
      });
    }

    const paymentNumber = await generatePaymentNumber();

    const payment = await Payment.create({
      paymentNumber,
      invoice,
      customer: existingInvoice.customer,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
      createdBy: req.user._id,
    });

    await updateInvoicePaymentStatus(existingInvoice);

    const populatedPayment = await Payment.findById(payment._id)
      .populate("invoice", "invoiceNumber grandTotal amountPaid balanceDue status")
      .populate("customer", "name email phone company");

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: populatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ createdBy: req.user._id })
      .populate("invoice", "invoiceNumber grandTotal amountPaid balanceDue status")
      .populate("customer", "name email phone company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate("invoice", "invoiceNumber grandTotal amountPaid balanceDue status")
      .populate("customer", "name email phone company");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const invoice = await Invoice.findById(payment.invoice);

    await payment.deleteOne();

    if (invoice) {
      await updateInvoicePaymentStatus(invoice);
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  deletePayment,
};