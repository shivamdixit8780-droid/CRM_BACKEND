const CompanySettings = require('../models/CompanySettings');

// Get company settings (sab dekh sakte hain)
const getCompanySettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();

    // agar abhi tak koi settings nahi bani, to ek default bana do
    if (!settings) {
      settings = await CompanySettings.create({});
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update company settings (sirf admin)
const updateCompanySettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();

    if (!settings) {
      settings = await CompanySettings.create({});
    }

    if (req.body.companyName) {
      settings.companyName = req.body.companyName;
    }

    // agar file upload hui hai (logo), to uska path save karo
    if (req.file) {
      settings.companyLogo = `/uploads/${req.file.filename}`;
    }

    await settings.save();

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompanySettings,
  updateCompanySettings,
};