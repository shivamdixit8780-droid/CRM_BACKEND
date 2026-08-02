const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const FollowUp = require('../models/FollowUp');

// Create a new lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, address, source, status, assignedTo } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      address,
      source,
      status,
      assignedTo: assignedTo || req.user._id,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leads (role-based filtering)
const getLeads = async (req, res) => {
  try {
    let leads;

    if (req.user.role === 'admin' || req.user.role === 'manager') {
      leads = await Lead.find().populate('assignedTo', 'name email role');
    } else {
      leads = await Lead.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email role');
    }

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email role');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'sales' && lead.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update lead (+ auto-create Customer if status becomes "Converted")
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'sales' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const wasConvertedBefore = lead.status === 'Converted';

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // agar status "Converted" hua hai (aur pehle nahi tha), to Customer bana do
    if (updatedLead.status === 'Converted' && !wasConvertedBefore) {
  let customer = await Customer.findOne({ convertedFromLead: updatedLead._id });

  if (!customer) {
    customer = await Customer.create({
      name: updatedLead.name,
      email: updatedLead.email,
      phone: updatedLead.phone,
      address: updatedLead.address,
      source: updatedLead.source,
      assignedTo: updatedLead.assignedTo,
      convertedFromLead: updatedLead._id,
    });
  }

  // is lead ke saare follow-ups ko naye customer se link kar do
  await FollowUp.updateMany(
    { lead: updatedLead._id },
    {
      $set: { customer: customer._id },
      $unset: { lead: "" },
    }
  );
}

    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'sales') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await lead.deleteOne();

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};