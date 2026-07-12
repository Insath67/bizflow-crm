const Company = require("../models/Company");

const getCompany = async (req, res) => {
  try {
    let company = await Company.findOne({ user: req.user._id });

    if (!company) {
      company = await Company.create({
        user: req.user._id,
        businessName: "",
        businessEmail: req.user.email || "",
        phone: "",
        address: "",
        website: "",
        taxNumber: "",
        currency: "LKR",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company settings loaded successfully.",
      data: company,
    });
  } catch (error) {
    console.error("Get Company Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load company settings.",
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      phone,
      address,
      website,
      taxNumber,
      currency,
    } = req.body;

    const company = await Company.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        businessName: businessName?.trim() || "",
        businessEmail: businessEmail?.toLowerCase().trim() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        website: website?.trim() || "",
        taxNumber: taxNumber?.trim() || "",
        currency: currency?.trim() || "LKR",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Company settings updated successfully.",
      data: company,
    });
  } catch (error) {
    console.error("Update Company Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update company settings.",
    });
  }
};

module.exports = {
  getCompany,
  updateCompany,
};