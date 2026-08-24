import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

// Fix DNS resolution for MongoDB Atlas SRV records in serverless environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {}

dotenv.config({ path: new URL("../server/.env", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1") });

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cached DB connection for serverless cold starts
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj";

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  isConnected = true;
  console.log("✅ MongoDB Atlas connected (Vercel Serverless)");

  // Auto-seed users if empty
  try {
    const { ensureUsersSeeded } = await import("../server/dist/config/db.js");
    await ensureUsersSeeded();
  } catch (e) {
    console.warn("Seeding warning:", e?.message ?? e);
  }
}

// Middleware: connect DB before every request
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Vercel DB Connection Error:", err);
    next(err);
  }
});

// Import compiled server API routes
const { default: apiRoutes } = await import("../server/dist/routes/apiRoutes.js");
app.use("/api", apiRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    server: "ROOFI Vercel Serverless",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

export default app;
