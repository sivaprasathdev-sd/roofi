import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/apiRoutes.js";

import { getUploadsDir } from "./config/upload.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5039;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

// Static File Serving for Uploads directory
const uploadsPath = getUploadsDir();
app.use("/uploads", express.static(uploadsPath));

// Database Connection & Auto-Seeding
connectDB();

// API Routes
app.use("/api", apiRoutes);

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", server: "ROOFI Express Server", time: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 ROOFI Server running on port ${PORT}`);
  console.log(`📂 Static uploads served from ${uploadsPath}`);
});
