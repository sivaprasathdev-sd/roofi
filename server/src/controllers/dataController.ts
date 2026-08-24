import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { Lead } from "../models/Lead.js";
import { Customer } from "../models/Customer.js";
import { Quotation } from "../models/Quotation.js";
import { Proforma } from "../models/Proforma.js";
import { Invoice } from "../models/Invoice.js";
import { State } from "../models/State.js";
import { Cluster } from "../models/Cluster.js";
import { Material } from "../models/Material.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { User } from "../models/User.js";
import { RoleModel } from "../models/Role.js";
import { SettingsModel } from "../models/Settings.js";
import { seedDatabase } from "../seed/seedData.js";
import { getUploadsDir, buildPublicFileUrl } from "../config/upload.js";

// Leads
export async function getLeads(req: Request, res: Response): Promise<void> {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
}

export async function createLead(req: Request, res: Response): Promise<void> {
  try {
    const { phone } = req.body;
    if (phone) {
      const cleanInput = phone.replace(/\D/g, "");
      const allLeads = await Lead.find({}, "phone");
      const duplicate = allLeads.find((l) => {
        const cleanExisting = (l.phone || "").replace(/\D/g, "");
        return cleanExisting && cleanInput && cleanExisting === cleanInput;
      });

      if (duplicate) {
        res.status(400).json({ message: "Already this number is existing." });
        return;
      }
    }

    const count = await Lead.countDocuments();
    const generatedId = `LD-${1001 + count}`;
    const newLead = new Lead({
      ...req.body,
      id: req.body.id || generatedId,
      createdDate: req.body.createdDate || new Date().toISOString().slice(0, 10),
      timeline:
        req.body.timeline && req.body.timeline.length > 0
          ? req.body.timeline
          : [
              {
                label: "Lead Created",
                at: new Date().toISOString().slice(0, 10),
                by: req.body.source || "Manual",
              },
            ],
    });
    await newLead.save();
    res.status(201).json(newLead);
  } catch (error: any) {
    console.error("createLead error:", error);
    res.status(500).json({ message: error.message || "Failed to create lead" });
  }
}

export async function deleteLeads(req: Request, res: Response): Promise<void> {
  try {
    await Lead.deleteMany({});
    await Customer.deleteMany({});
    await Quotation.deleteMany({});
    await Proforma.deleteMany({});
    await Invoice.deleteMany({});
    await ActivityLog.deleteMany({});
    res.json({ message: "All leads, lead assignments, customers, quotations, proforma invoices, and history logs deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete data" });
  }
}

export async function updateLead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await Lead.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    // Auto-create Customer when Lead is converted
    if (updated.status === "Converted") {
      const existingCust = await Customer.findOne({ leadId: updated.id });
      if (!existingCust) {
        const custCount = await Customer.countDocuments();
        await Customer.create({
          id: `CUST-${1001 + custCount}`,
          name: updated.customerName,
          phone: updated.phone,
          email: updated.email || `${updated.id.toLowerCase()}@customer.com`,
          location: updated.city,
          address: updated.address || `${updated.city}, ${updated.stateId}`,
          stateId: updated.stateId,
          clusterId: updated.clusterId || "CL-001",
          leadId: updated.id,
          quotations: 1,
          invoices: 0,
          purchaseValue: updated.estValue || 0,
          status: "Active",
          createdDate: new Date().toISOString().slice(0, 10),
        });
      }
    }

    // Create ActivityLog entry for Lead history tracking
    try {
      const logCount = await ActivityLog.countDocuments();
      await ActivityLog.create({
        id: `LOG-${Date.now()}-${logCount}`,
        at: new Date().toISOString().replace("T", " ").slice(0, 16),
        user: req.body.updatedBy || req.body.assignedBy || "System User",
        role: req.body.userRole || "cluster",
        action: updated.status === "Converted" ? "Converted to Customer" : "Lead Activity Update",
        module: "Leads",
        record: updated.id,
        description: req.body.note || `Lead ${updated.id} status updated to ${updated.status}`,
        ip: req.ip || "127.0.0.1",
        leadId: updated.id,
        stateId: updated.stateId,
        clusterId: updated.clusterId,
      });
    } catch (logErr) {
      console.warn("Could not save activity log", logErr);
    }

    res.json(updated);
  } catch (error: any) {
    console.error("updateLead error:", error);
    res.status(500).json({ message: "Failed to update lead" });
  }
}

export async function getLeadActivityLogs(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const logs = await ActivityLog.find({
      $or: [{ leadId: id }, { record: id }],
    }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lead logs" });
  }
}

// Customers
export async function getCustomers(req: Request, res: Response): Promise<void> {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers" });
  }
}

// Quotations
export async function getQuotations(req: Request, res: Response): Promise<void> {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quotations" });
  }
}

export async function createQuotation(req: Request, res: Response): Promise<void> {
  try {
    const count = await Quotation.countDocuments();
    const newQuotation = new Quotation({
      ...req.body,
      id: req.body.id || `QT-2026-${String(count + 1).padStart(4, "0")}`,
      date: req.body.date || new Date().toISOString().slice(0, 10),
      validUntil: req.body.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    });
    await newQuotation.save();
    res.status(201).json(newQuotation);
  } catch (error: any) {
    console.error("createQuotation error:", error);
    res.status(500).json({ message: error.message || "Failed to create quotation" });
  }
}

// Proformas
export async function getProformas(req: Request, res: Response): Promise<void> {
  try {
    const proformas = await Proforma.find().sort({ createdAt: -1 });
    res.json(proformas);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch proformas" });
  }
}

export async function createProforma(req: Request, res: Response): Promise<void> {
  try {
    const count = await Proforma.countDocuments();
    const newProforma = new Proforma({
      ...req.body,
      id: req.body.id || `PI-2026-${String(count + 1).padStart(4, "0")}`,
      date: req.body.date || new Date().toISOString().slice(0, 10),
      dueDate: req.body.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    });
    await newProforma.save();
    res.status(201).json(newProforma);
  } catch (error: any) {
    console.error("createProforma error:", error);
    res.status(500).json({ message: error.message || "Failed to create proforma invoice" });
  }
}

// Invoices
export async function getInvoices(req: Request, res: Response): Promise<void> {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
}

// Network Data (States & Clusters)
export async function getStates(req: Request, res: Response): Promise<void> {
  try {
    const states = await State.find().sort({ name: 1 });
    res.json(states);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch states" });
  }
}

export async function createState(req: Request, res: Response): Promise<void> {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      res.status(400).json({ message: "State name and code are required." });
      return;
    }

    const stateCode = code.toUpperCase().trim();
    const existing = await State.findOne({ code: stateCode });
    if (existing) {
      res.status(400).json({ message: `State with code ${stateCode} already exists.` });
      return;
    }

    const newState = new State({
      id: stateCode,
      name: name.trim(),
      code: stateCode,
    });
    await newState.save();

    res.status(201).json({ message: "State created successfully in MongoDB", state: newState });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create state" });
  }
}

export async function getClusters(req: Request, res: Response): Promise<void> {
  try {
    const clusters = await Cluster.find().sort({ name: 1 });
    res.json(clusters);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clusters" });
  }
}

export async function createCluster(req: Request, res: Response): Promise<void> {
  try {
    const { name, code, stateId, company, address, gst, phone, email, manager } = req.body;
    if (!name || !stateId) {
      res.status(400).json({ message: "Cluster name and State assignment are required." });
      return;
    }

    const count = await Cluster.countDocuments();
    const clusterId = `CL-${String(count + 1).padStart(3, "0")}`;
    const clusterCode = code ? code.toUpperCase().trim() : `${stateId}-${name.slice(0, 3).toUpperCase()}`;

    const newCluster = new Cluster({
      id: clusterId,
      name: name.trim(),
      code: clusterCode,
      stateId,
      company: company || `ROOFI ${name} Solutions Pvt Ltd`,
      address: address || `${name} Industrial Hub`,
      gst: gst || `29AABCR${1000 + count}K1Z`,
      phone: phone || "+91 98400 00000",
      email: email || `${name.toLowerCase().replace(/\s+/g, "")}@roofi.in`,
      manager: manager || "Unassigned",
    });

    await newCluster.save();
    res.status(201).json({ message: "Cluster created successfully in MongoDB", cluster: newCluster });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create cluster" });
  }
}

// Roles Management
export async function getRoles(req: Request, res: Response): Promise<void> {
  try {
    let roles = await RoleModel.find().sort({ createdAt: 1 });
    if (roles.length === 0) {
      roles = [
        { id: "R-001", name: "HO Admin", code: "ho", description: "Head Office Administrator" } as any,
        { id: "R-002", name: "State HO / Admin", code: "state", description: "State Administrator" } as any,
        { id: "R-003", name: "Cluster Manager", code: "cluster", description: "Cluster Hub Manager" } as any,
      ];
    }
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch roles" });
  }
}

export async function createRole(req: Request, res: Response): Promise<void> {
  try {
    const { name, code, description } = req.body;
    if (!name) {
      res.status(400).json({ message: "Role name is required." });
      return;
    }

    const roleCode = code ? code.toLowerCase().trim() : name.toLowerCase().replace(/\s+/g, "-");
    const existing = await RoleModel.findOne({ name: name.trim() });
    if (existing) {
      res.status(400).json({ message: `Role '${name}' already exists in MongoDB.` });
      return;
    }

    const count = await RoleModel.countDocuments();
    const newRole = new RoleModel({
      id: `R-${String(count + 1).padStart(3, "0")}`,
      name: name.trim(),
      code: roleCode,
      description: description || `${name} role permissions`,
    });

    await newRole.save();
    res.status(201).json({ message: "Role created successfully in MongoDB", role: newRole });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create role" });
  }
}

// Materials & Resources Management
export async function getMaterials(req: Request, res: Response): Promise<void> {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch materials" });
  }
}

export async function createMaterial(req: Request, res: Response): Promise<void> {
  try {
    const { name, category, fileData, fileName, uploadedBy } = req.body;

    if (!name || !category) {
      res.status(400).json({ message: "Document name and category are required." });
      return;
    }

    let fileUrl = "";
    let finalFileName = fileName || "document";
    let calculatedSize = "1.2 MB";
    let fileType = "Document";

    if (fileData) {
      const uploadsDir = getUploadsDir();

      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = "pdf";

      if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes("pdf")) {
          ext = "pdf";
          fileType = "PDF";
        } else if (mime.includes("png") || mime.includes("jpeg") || mime.includes("jpg") || mime.includes("svg")) {
          ext = mime.includes("png") ? "png" : mime.includes("svg") ? "svg" : "jpg";
          fileType = "Image";
        } else if (mime.includes("sheet") || mime.includes("excel")) {
          ext = "xlsx";
          fileType = "Spreadsheet";
        } else if (mime.includes("presentation") || mime.includes("powerpoint")) {
          ext = "pptx";
          fileType = "Presentation";
        } else {
          ext = "doc";
          fileType = "Document";
        }

        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(fileData, "base64");
      }

      const bytes = buffer.length;
      calculatedSize = bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

      finalFileName = `material_${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, finalFileName);
      fs.writeFileSync(filePath, buffer);
      fileUrl = buildPublicFileUrl(req, finalFileName);
    }

    const count = await Material.countDocuments();
    const newMaterial = new Material({
      id: `MT-${String(count + 1).padStart(3, "0")}`,
      name: name.trim(),
      fileUrl,
      fileName: finalFileName,
      type: fileType,
      category: category.trim(),
      uploadedBy: uploadedBy || "HO Admin",
      uploadDate: new Date().toISOString().slice(0, 10),
      size: calculatedSize,
    });

    await newMaterial.save();
    res.status(201).json({ message: "Material uploaded successfully to MongoDB", material: newMaterial });
  } catch (error: any) {
    console.error("Create Material error:", error);
    res.status(400).json({ message: error.message || "Failed to create material" });
  }
}

export async function updateMaterial(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const material = await Material.findOne({ id });
    if (!material) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    if (name) material.name = name.trim();
    if (category) material.category = category.trim();

    await material.save();
    res.json({ message: "Material updated successfully", material });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update material" });
  }
}

export async function deleteMaterial(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const material = await Material.findOne({ id });
    if (!material) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    if (material.fileName) {
      const uploadsDir = getUploadsDir();
      const filePath = path.join(uploadsDir, material.fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }
    }

    await Material.deleteOne({ id });
    res.json({ message: "Material deleted successfully from MongoDB" });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to delete material" });
  }
}

export async function getActivityLogs(req: Request, res: Response): Promise<void> {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
}

// Users Management
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const { stateId } = req.query;
    let query: any = {};
    if (stateId) {
      query.stateId = String(stateId);
    }
    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, phone, role, stateId, clusterId } = req.body;

    if (!name || !email || !password || !phone || !role) {
      res.status(400).json({ message: "Name, email, password, phone number, and role are required." });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ message: "A user with this email address already exists in MongoDB." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const count = await User.countDocuments();
    const newId = `U-${String(count + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;

    const newUser = new User({
      id: newId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      role: role.trim(),
      stateId,
      clusterId,
      status: "Active",
      lastLogin: new Date().toISOString().replace("T", " ").slice(0, 16),
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ message: "User created successfully in MongoDB", user: userObj });
  } catch (error: any) {
    console.error("Create User error:", error);
    res.status(400).json({ message: error.message || "Failed to create user in MongoDB" });
  }
}

export async function updateUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const { userId, name, phone, password } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (password && password.trim().length >= 4) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ message: "Profile updated successfully", user: userObj });
  } catch (error: any) {
    console.error("Update Profile error:", error);
    res.status(400).json({ message: error.message || "Failed to update profile" });
  }
}

// Reset Database & Clean Wipe
export async function resetDatabaseController(req: Request, res: Response): Promise<void> {
  try {
    await seedDatabase(true);
    res.json({ message: "Database wiped clean! Ready for manual workflow testing by Admin, State Admin, and Cluster telecallers." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to reset database" });
  }
}

// Settings Management
export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const { stateId, clusterId } = req.query;
    let query: any = {};
    if (clusterId) query.clusterId = String(clusterId);
    else if (stateId) query.stateId = String(stateId);

    let settings = await SettingsModel.findOne(query);
    if (!settings && (clusterId || stateId)) {
      // Fallback to global settings
      settings = await SettingsModel.findOne({});
    }
    if (!settings) {
      settings = new SettingsModel({
        stateId: stateId ? String(stateId) : undefined,
        clusterId: clusterId ? String(clusterId) : undefined,
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const { stateId, clusterId } = req.body;
    let query: any = {};
    if (clusterId) query.clusterId = String(clusterId);
    else if (stateId) query.stateId = String(stateId);

    let settings = Object.keys(query).length > 0 ? await SettingsModel.findOne(query) : await SettingsModel.findOne({});

    if (!settings) {
      settings = new SettingsModel(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ message: "Quotation template & system settings updated successfully", settings });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update settings" });
  }
}

export async function uploadSettingsFile(req: Request, res: Response): Promise<void> {
  try {
    const { fileName, fileData, type } = req.body;
    if (!fileData) {
      res.status(400).json({ message: "No file data provided." });
      return;
    }

    const uploadsDir = getUploadsDir();

    // Extract base64 format
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "png";

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes("ico") || mime.includes("x-icon")) ext = "ico";
      else if (mime.includes("png")) ext = "png";
      else if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
      else if (mime.includes("svg")) ext = "svg";
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(fileData, "base64");
    }

    const cleanPrefix = type === "ico" ? "favicon" : "brand_logo";
    const name = `${cleanPrefix}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, name);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = buildPublicFileUrl(req, name);
    res.json({ message: "File uploaded successfully to root uploads/", url: publicUrl, fileName: name });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message || "Failed to upload file" });
  }
}
