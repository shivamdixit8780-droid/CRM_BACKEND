const Lead = require("../models/Lead");
const Order = require("../models/Order");

// ✅ GET ALL LEADS - Role based filter
exports.getLeads = async (req, res) => {
  console.log("========== GET LEADS ==========");
  console.log("User:", req.user);
  console.log("Role:", req.user?.role);
  
  try {
    let filter = { convertedToOrder: false };
    
    if (req.user.role === "sales") {
      filter.assignedTo = req.user._id;
    }
    
    console.log("Filter:", filter);
    
    // ✅ Pehle leads fetch karo
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    
    // ✅ Ab console.log karo (leads ke baad)
    console.log("Leads found:", leads.length);
    console.log("===============================");
    
    res.json(leads);
  } catch (err) {
    console.error("Get leads error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET LEAD BY ID - permission check
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Sales user sirf apna lead dekh sake
    if (
      req.user.role === "sales" &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CREATE LEAD - already sahi hai
exports.createLead = async (req, res) => {
  try {
    const {
      name, email, phone, address, pincode,
      city, state, product, price, notes, source, status, followUpDate,
    } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    // Validate Indian phone
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          message: "Invalid Indian phone number! Must be 10 digits starting with 6-9.",
        });
      }
    }

    // Order Done validation
    if (status === "Order Done") {
      if (!product) return res.status(400).json({ message: "Product is required for Order!" });
      if (!price || Number(price) <= 0)
        return res.status(400).json({ message: "Price is required for Order!" });
    }

    // Interested → Follow-up date required
    if (status === "Interested" && !followUpDate) {
      return res.status(400).json({ message: "Follow-up date is required for Interested leads!" });
    }

    // ✅ Generate unique Lead ID - USER SPECIFIC count
    const count = await Lead.countDocuments({ assignedTo: req.user?._id });
    const leadId = `LD-${String(count + 1).padStart(4, "0")}`;

    const newLead = await Lead.create({
      leadId, name, email, phone, address, pincode,
      city, state, product, price, notes, source, status, followUpDate,
      assignedTo: req.user?._id,
    });

    console.log("✅ Lead created:", newLead.leadId);

    // Order Done → Auto create Order
    if (status === "Order Done") {
      try {
        const newOrder = await Order.create({
          customerName: name,
          email: email || "",
          phone: phone || "",
          address: address || "",
          pincode: pincode || "",
          city: city || "",
          state: state || "",
          product,
          amount: Number(price),
          notes: notes || "",
          status: "Pending",
          leadId: newLead._id,
          leadCode: newLead.leadId,
          createdBy: req.user?._id,
        });
        newLead.convertedToOrder = true;
        await newLead.save();
        console.log("✅ Order auto-created:", newOrder._id);
      } catch (oErr) {
        console.error("❌ Order create failed:", oErr.message);
      }
    }

    res.status(201).json(newLead);
  } catch (err) {
    console.error("❌ Create lead error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE LEAD - permission check
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // ✅ Sales user sirf apna lead update kare
    if (
      req.user.role === "sales" &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (updateData.phone) {
      const cleanPhone = updateData.phone.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          message: "Invalid Indian phone number!",
        });
      }
    }

    // Interested → Follow-up date required
    if (updateData.status === "Interested" && !updateData.followUpDate) {
      return res.status(400).json({ message: "Follow-up date is required for Interested leads!" });
    }

    // Order Done → Auto create Order
    if (updateData.status === "Order Done" && !lead.convertedToOrder) {
      const finalPrice = Number(updateData.price || lead.price || 0);

      if (!finalPrice || finalPrice <= 0) {
        return res.status(400).json({ message: "Price is required for Order!" });
      }
      if (!updateData.product && !lead.product) {
        return res.status(400).json({ message: "Product is required for Order!" });
      }

      try {
        const newOrder = await Order.create({
          customerName: updateData.name || lead.name,
          email: updateData.email || lead.email || "",
          phone: updateData.phone || lead.phone || "",
          address: updateData.address || lead.address || "",
          pincode: updateData.pincode || lead.pincode || "",
          city: updateData.city || lead.city || "",
          state: updateData.state || lead.state || "",
          product: updateData.product || lead.product,
          amount: finalPrice,
          notes: updateData.notes || "",
          status: "Pending",
          leadId: lead._id,
          leadCode: lead.leadId,
          createdBy: lead.assignedTo,  // ✅ Lead ka original owner
        });
        updateData.convertedToOrder = true;
        console.log("✅ Order created from update:", newOrder._id);
      } catch (oErr) {
        return res.status(500).json({ message: "Order create failed: " + oErr.message });
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedLead);
  } catch (err) {
    console.error("❌ Update lead error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE LEAD - permission check
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Sales user sirf apna lead delete kare
    if (
      req.user.role === "sales" &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await lead.deleteOne();
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};