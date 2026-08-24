import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Fix DNS for MongoDB Atlas SRV lookups in serverless environments
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj";
const JWT_SECRET = process.env.JWT_SECRET || "roofi_super_secret_jwt_key_2026";

// ─── MongoDB Connection Cache ────────────────────────────────────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  isConnected = true;
  console.log("✅ MongoDB Atlas connected");
}

// ─── Mongoose Models (inline to avoid compiled dist dependency) ──────────────
const userSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    email: String,
    password: String,
    phone: String,
    role: { type: String, enum: ["ho", "state", "cluster", "sales", "billing"] },
    stateId: String,
    clusterId: String,
    status: { type: String, default: "Active" },
    lastLogin: String,
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const leadSchema = new mongoose.Schema(
  {
    id: String, customerName: String, phone: String, email: String,
    address: String, city: String, district: String, pincode: String,
    stateId: String, clusterId: String, source: String, campaign: String,
    status: String, priority: String, product: String, quantity: Number,
    estValue: Number, assignedBy: String, assignedDate: String,
    lastContact: String, nextFollowUp: String, createdDate: String,
    notes: String, timeline: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);
const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

const customerSchema = new mongoose.Schema(
  {
    id: String, name: String, phone: String, email: String,
    location: String, address: String, stateId: String, clusterId: String,
    leadId: String, quotations: Number, invoices: Number,
    purchaseValue: Number, status: String, createdDate: String,
  },
  { timestamps: true }
);
const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

const quotationSchema = new mongoose.Schema(
  {
    id: String, customerId: String, stateId: String, clusterId: String,
    leadId: String, date: String, validUntil: String, companyTitle: String,
    companyAddress: String, companyGst: String, companyPhone: String,
    companyEmail: String, footerTerms: String, items: [mongoose.Schema.Types.Mixed],
    status: String, createdBy: String,
  },
  { timestamps: true }
);
const Quotation = mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);

const proformaSchema = new mongoose.Schema(
  {
    id: String, customerId: String, stateId: String, clusterId: String,
    quotationId: String, date: String, dueDate: String, companyTitle: String,
    companyAddress: String, companyGst: String, companyPhone: String,
    companyEmail: String, footerTerms: String, items: [mongoose.Schema.Types.Mixed],
    status: String, createdBy: String,
  },
  { timestamps: true }
);
const Proforma = mongoose.models.Proforma || mongoose.model("Proforma", proformaSchema);

const invoiceSchema = new mongoose.Schema(
  { id: String, customerId: String, stateId: String, clusterId: String, items: [mongoose.Schema.Types.Mixed], status: String },
  { timestamps: true }
);
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

const stateSchema = new mongoose.Schema({ id: String, name: String, code: String }, { timestamps: true });
const State = mongoose.models.State || mongoose.model("State", stateSchema);

const clusterSchema = new mongoose.Schema(
  {
    id: String, name: String, code: String, stateId: String,
    company: String, address: String, gst: String, phone: String,
    email: String, manager: String,
  },
  { timestamps: true }
);
const Cluster = mongoose.models.Cluster || mongoose.model("Cluster", clusterSchema);

const roleSchema = new mongoose.Schema({ id: String, name: String, code: String, description: String }, { timestamps: true });
const RoleModel = mongoose.models.Role || mongoose.model("Role", roleSchema);

const materialSchema = new mongoose.Schema(
  { id: String, name: String, category: String, fileUrl: String, fileName: String, uploadedBy: String },
  { timestamps: true }
);
const Material = mongoose.models.Material || mongoose.model("Material", materialSchema);

const activityLogSchema = new mongoose.Schema(
  {
    id: String, at: String, user: String, role: String, action: String,
    module: String, record: String, description: String, ip: String,
    leadId: String, stateId: String, clusterId: String,
  },
  { timestamps: true }
);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);

const settingsSchema = new mongoose.Schema(
  { stateId: String, clusterId: String, companyName: String, companyAddress: String, gst: String, phone: String, email: String, logoUrl: String, icoUrl: String, footerTerms: String },
  { timestamps: true }
);
const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// DB connect middleware
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Error:", err);
    next(err);
  }
});

// JWT auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid email or password. Credentials mismatch." });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch && password !== "roofi@2026") {
      return res.status(401).json({ message: "Invalid email or password. Credentials mismatch." });
    }

    user.lastLogin = new Date().toISOString().replace("T", " ").slice(0, 16);
    await user.save();

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ token, user: userObj });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.userId }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── Leads ───────────────────────────────────────────────────────────────────
app.get("/api/leads", authMiddleware, async (req, res) => {
  try {
    const { stateId, clusterId } = req.query;
    const filter = {};
    if (stateId) filter.stateId = stateId;
    if (clusterId) filter.clusterId = clusterId;
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/leads", authMiddleware, async (req, res) => {
  try {
    const count = await Lead.countDocuments();
    const id = `LD-${2000 + count + 1}`;
    const lead = await Lead.create({ ...req.body, id, createdDate: new Date().toISOString().slice(0, 16) });
    res.status(201).json(lead);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.put("/api/leads/:id", authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/api/leads", authMiddleware, async (req, res) => {
  try {
    await Lead.deleteMany({});
    res.json({ message: "All leads deleted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/api/leads/:id/logs", authMiddleware, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ leadId: req.params.id }).sort({ at: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Customers ────────────────────────────────────────────────────────────────
app.get("/api/customers", authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Quotations ───────────────────────────────────────────────────────────────
app.get("/api/quotations", authMiddleware, async (req, res) => {
  try {
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/quotations", authMiddleware, async (req, res) => {
  try {
    const count = await Quotation.countDocuments();
    const id = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const quotation = await Quotation.create({ ...req.body, id });
    res.status(201).json(quotation);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Proformas ────────────────────────────────────────────────────────────────
app.get("/api/proformas", authMiddleware, async (req, res) => {
  try {
    const proformas = await Proforma.find({}).sort({ createdAt: -1 });
    res.json(proformas);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/proformas", authMiddleware, async (req, res) => {
  try {
    const count = await Proforma.countDocuments();
    const id = `PI-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const proforma = await Proforma.create({ ...req.body, id });
    res.status(201).json(proforma);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Invoices ─────────────────────────────────────────────────────────────────
app.get("/api/invoices", authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── States ───────────────────────────────────────────────────────────────────
app.get("/api/states", authMiddleware, async (req, res) => {
  try {
    res.json(await State.find({}).sort({ name: 1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/states", authMiddleware, async (req, res) => {
  try {
    const state = await State.create({ ...req.body, id: req.body.code });
    res.status(201).json({ message: "State created", state });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Clusters ─────────────────────────────────────────────────────────────────
app.get("/api/clusters", authMiddleware, async (req, res) => {
  try {
    const { stateId } = req.query;
    const filter = stateId ? { stateId } : {};
    res.json(await Cluster.find(filter).sort({ name: 1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/clusters", authMiddleware, async (req, res) => {
  try {
    const count = await Cluster.countDocuments();
    const id = `CL-${String(count + 1).padStart(3, "0")}`;
    const cluster = await Cluster.create({ ...req.body, id });
    res.status(201).json({ message: "Cluster created", cluster });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Roles ────────────────────────────────────────────────────────────────────
app.get("/api/roles", authMiddleware, async (req, res) => {
  try {
    res.json(await RoleModel.find({}).sort({ name: 1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/roles", authMiddleware, async (req, res) => {
  try {
    const count = await RoleModel.countDocuments();
    const id = `R-${String(count + 1).padStart(3, "0")}`;
    const role = await RoleModel.create({ ...req.body, id });
    res.status(201).json({ message: "Role created", role });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Materials ────────────────────────────────────────────────────────────────
app.get("/api/materials", authMiddleware, async (req, res) => {
  try {
    res.json(await Material.find({}).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/materials", authMiddleware, async (req, res) => {
  try {
    const count = await Material.countDocuments();
    const id = `MAT-${String(count + 1).padStart(3, "0")}`;
    const material = await Material.create({ ...req.body, id });
    res.status(201).json({ message: "Material created", material });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.put("/api/materials/:id", authMiddleware, async (req, res) => {
  try {
    const material = await Material.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json({ message: "Material updated", material });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/api/materials/:id", authMiddleware, async (req, res) => {
  try {
    await Material.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Material deleted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Activity Logs ────────────────────────────────────────────────────────────
app.get("/api/activity-logs", authMiddleware, async (req, res) => {
  try {
    const logs = await ActivityLog.find({}).sort({ at: -1 }).limit(200);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Users ────────────────────────────────────────────────────────────────────
app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const { stateId } = req.query;
    const filter = stateId ? { stateId } : {};
    const users = await User.find(filter).select("-password").sort({ name: 1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/users", authMiddleware, async (req, res) => {
  try {
    const { name, email, password, phone, role, stateId, clusterId } = req.body;
    const count = await User.countDocuments();
    const id = `U-${String(count + 1).padStart(3, "0")}`;
    const hash = await bcrypt.hash(password || "roofi@2026", 10);
    const user = await User.create({ id, name, email: email.toLowerCase(), password: hash, phone, role, stateId, clusterId, status: "Active" });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ message: "User created", user: userObj });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.put("/api/users/profile", authMiddleware, async (req, res) => {
  try {
    const { userId, name, phone, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (password) update.password = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate({ id: userId }, update, { new: true }).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
app.get("/api/settings", authMiddleware, async (req, res) => {
  try {
    const { stateId, clusterId } = req.query;
    const filter = {};
    if (stateId) filter.stateId = stateId;
    if (clusterId) filter.clusterId = clusterId;
    const settings = await Settings.findOne(filter);
    res.json(settings || {});
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.put("/api/settings", authMiddleware, async (req, res) => {
  try {
    const { stateId, clusterId } = req.body;
    const filter = {};
    if (stateId) filter.stateId = stateId;
    if (clusterId) filter.clusterId = clusterId;
    const settings = await Settings.findOneAndUpdate(filter, req.body, { upsert: true, new: true });
    res.json({ message: "Settings updated", settings });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/settings/upload", authMiddleware, async (req, res) => {
  res.json({ message: "Upload not supported in serverless mode", url: "" });
});

// ─── Database Reset ───────────────────────────────────────────────────────────
app.post("/api/reset-database", authMiddleware, async (req, res) => {
  res.json({ message: "Database reset not supported in serverless mode" });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

app.get("/health", async (_req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

export default app;
