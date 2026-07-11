const Customer = require("../models/Customer");
const Item = require("../models/Item");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalCustomers = await Customer.countDocuments({ createdBy: userId });
    const totalItems = await Item.countDocuments({ createdBy: userId });
    const totalQuotations = await Quotation.countDocuments({ createdBy: userId });
    const totalInvoices = await Invoice.countDocuments({ createdBy: userId });

    const invoiceStats = await Invoice.aggregate([
      {
        $match: {
          createdBy: userId,
        },
      },
      {
        $group: {
          _id: null,
          totalInvoiceAmount: { $sum: "$grandTotal" },
          totalAmountPaid: { $sum: "$amountPaid" },
          totalBalanceDue: { $sum: "$balanceDue" },
        },
      },
    ]);

    const paymentStats = await Payment.aggregate([
      {
        $match: {
          createdBy: userId,
        },
      },
      {
        $group: {
          _id: null,
          totalPaymentsReceived: { $sum: "$amount" },
        },
      },
    ]);

    const recentInvoices = await Invoice.find({ createdBy: userId })
      .populate("customer", "name company phone")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({ createdBy: userId })
      .populate("invoice", "invoiceNumber")
      .populate("customer", "name company phone")
      .sort({ createdAt: -1 })
      .limit(5);

    const invoiceSummary = invoiceStats[0] || {
      totalInvoiceAmount: 0,
      totalAmountPaid: 0,
      totalBalanceDue: 0,
    };

    const paymentSummary = paymentStats[0] || {
      totalPaymentsReceived: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        totals: {
          customers: totalCustomers,
          items: totalItems,
          quotations: totalQuotations,
          invoices: totalInvoices,
        },

        financial: {
          totalInvoiceAmount: invoiceSummary.totalInvoiceAmount,
          totalAmountPaid: invoiceSummary.totalAmountPaid,
          totalBalanceDue: invoiceSummary.totalBalanceDue,
          totalPaymentsReceived: paymentSummary.totalPaymentsReceived,
        },

        recentInvoices,
        recentPayments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};