const FollowUp = require('../models/FollowUp');

// ✅ Create follow-up
const createFollowUp = async (req, res) => {
  try {
    const { lead, customer, note, followUpDate, assignedTo } = req.body;

    const followUp = await FollowUp.create({
      lead: lead || undefined,
      customer: customer || undefined,
      note,
      followUpDate,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
    });

    console.log("✅ Follow-up created:", followUp._id);
    res.status(201).json(followUp);
  } catch (error) {
    console.error("❌ Create followup error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL FOLLOW-UPS (FIXED — sab role ke liye kaam karega)
const getFollowUps = async (req, res) => {
  try {
    let query = {};

    // Sales role → sirf apne assigned/created follow-ups
    if (req.user.role === 'sales') {
      query = {
        $or: [
          { assignedTo: req.user._id },
          { createdBy: req.user._id },
        ],
      };
    }
    // Admin/Manager → sabhi follow-ups (query empty rahega)

    const followUps = await FollowUp.find(query)
      .populate('lead', 'leadId name email phone status product price city state address')
      .populate('customer', 'name email phone address')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    console.log(`✅ Follow-ups fetched: ${followUps.length} for user role: ${req.user.role}`);
    res.status(200).json(followUps);
  } catch (error) {
    console.error("❌ Get followups error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single follow-up by ID
const getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id)
      .populate('lead', 'leadId name email phone status product price')
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name email role');

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    if (
      req.user.role === 'sales' &&
      followUp.assignedTo?._id.toString() !== req.user._id.toString() &&
      followUp.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update follow-up
const updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    if (
      req.user.role === 'sales' &&
      followUp.assignedTo?.toString() !== req.user._id.toString() &&
      followUp.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedFollowUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log("✅ Follow-up updated:", updatedFollowUp._id);
    res.status(200).json(updatedFollowUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete follow-up
const deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    // Allow admin, manager, or the creator to delete
    if (
      req.user.role === 'sales' &&
      followUp.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await followUp.deleteOne();

    res.status(200).json({ message: 'Follow-up deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
};