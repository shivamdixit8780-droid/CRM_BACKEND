const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'My CRM Company',
  },
  companyLogo: {
    type: String,   // file ka path/URL store hoga
  },
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', companySettingsSchema);