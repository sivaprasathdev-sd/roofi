import { Router } from "express";
import { login, getMe } from "../controllers/authController.js";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLeads,
  getLeadActivityLogs,
  getCustomers,
  getQuotations,
  createQuotation,
  getProformas,
  createProforma,
  getInvoices,
  getStates,
  createState,
  getClusters,
  createCluster,
  getRoles,
  createRole,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getActivityLogs,
  getUsers,
  createUser,
  updateUserProfile,
  resetDatabaseController,
  getSettings,
  updateSettings,
  uploadSettingsFile,
} from "../controllers/dataController.js";

const router = Router();

// Auth Routes
router.post("/auth/login", login);
router.get("/auth/me", getMe);

// Business & Entity Routes
router.get("/leads", getLeads);
router.post("/leads", createLead);
router.put("/leads/:id", updateLead);
router.get("/leads/:id/logs", getLeadActivityLogs);
router.delete("/leads", deleteLeads);

router.get("/customers", getCustomers);

router.get("/quotations", getQuotations);
router.post("/quotations", createQuotation);

router.get("/proformas", getProformas);
router.post("/proformas", createProforma);
router.get("/invoices", getInvoices);

// Network & Roles Setup
router.get("/states", getStates);
router.post("/states", createState);

router.get("/clusters", getClusters);
router.post("/clusters", createCluster);

router.get("/roles", getRoles);
router.post("/roles", createRole);

// Settings & Branding Routes
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.post("/settings/upload", uploadSettingsFile);

// Resources & Materials Management Routes
router.get("/materials", getMaterials);
router.post("/materials", createMaterial);
router.put("/materials/:id", updateMaterial);
router.delete("/materials/:id", deleteMaterial);

router.get("/activity-logs", getActivityLogs);

// User Management Routes
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/profile", updateUserProfile);

// Database Reset Route
router.post("/reset-database", resetDatabaseController);

export default router;
