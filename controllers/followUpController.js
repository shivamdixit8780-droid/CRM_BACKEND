const FollowUp = require('../models/FollowUp');

// Create a follow-up
const createFollowUp = async (req, res) => {
  try {
    const { lead, customer, note, followUpDate, assignedTo } = req.body;

    const followUp = await FollowUp.create({
      lead: lead || undefined,
      customer: customer || undefined,
      note,
      followUpDate,
      assignedTo: assignedTo || req.user._id,
    });

    res.status(201).json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all follow-ups (role-based filtering)
const getFollowUps = async (req, res) => {
  try {
    let followUps;

    if (req.user.role === 'admin' || req.user.role === 'manager') {
      followUps = await FollowUp.find()
        .populate('lead', 'name email phone status')
        .populate('customer', 'name email phone address')
        .populate('assignedTo', 'name email role');
    } else {
      const followUp = await FollowUp.findById(req.params.id)
        .populate('lead', 'name email phone status')
        .populate('customer', 'name email phone address')
        .populate('assignedTo', 'name email role');
    }

    res.status(200).json(followUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single follow-up by ID
const getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id)
      .populate('lead', 'name status')
      .populate('customer', 'name')
      .populate('assignedTo', 'name email role');

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    if (req.user.role === 'sales' && followUp.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update follow-up (jaise status Pending -> Completed karna)
const updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    if (req.user.role === 'sales' && followUp.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedFollowUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedFollowUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete follow-up
const deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    if (req.user.role === 'sales') {
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