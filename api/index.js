import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ensureUsersSeeded } from "../server/dist/config/db.js";
import apiRoutes from "../server/dist/routes/apiRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj";
  await mongoose.connect(mongoUri);
  isConnected = true;
  try {
    await ensureUsersSeeded();
  } catch (e) {
    console.warn("Vercel seeding warning:", e);
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Vercel DB Connection Error:", err);
    next();
  }
});

app.use("/api", apiRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "OK", server: "ROOFI Vercel Serverless Function", time: new Date() });
});

export default app;
