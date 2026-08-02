const Contact = require('../models/Contact');

// @desc Create new contact
const createContact = async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      status,
      notes,
      owner: req.user._id, // logged-in user se aayega (middleware se)
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single contact
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update contact
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // updated wala document return karega, purana nahi
    );

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
};