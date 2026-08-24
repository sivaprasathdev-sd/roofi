import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dns from "dns";
import { User } from "../models/User.js";
import { seedDatabase } from "../seed/seedData.js";
import { BASELINE_CREDENTIALS, DEFAULT_SYSTEM_PASSWORD } from "./credentials.js";

// Set reliable DNS servers for MongoDB Atlas SRV record lookups
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

export async function ensureUsersSeeded() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log("⚡ Users collection is empty. Initiating automatic seeding with full sample data...");
    await seedDatabase(false);
  } else {
    // Ensure baseline credentials exist in DB
    const defaultHash = await bcrypt.hash(DEFAULT_SYSTEM_PASSWORD, 10);
    let seededCount = 0;

    for (const cred of BASELINE_CREDENTIALS) {
      const exists = await User.findOne({ email: cred.email });
      if (!exists) {
        await User.create({
          ...cred,
          password: defaultHash,
        });
        seededCount++;
        console.log(`🔑 Automatically seeded missing credential: ${cred.email} (${cred.role})`);
      }
    }

    const currentTotal = await User.countDocuments();
    console.log(
      `✅ Users collection verified on connection (${currentTotal} total users${
        seededCount > 0 ? `, ${seededCount} new baseline credentials seeded` : ""
      }).`
    );
  }
}

export async function connectDB() {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj";
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected successfully!");

    // Automatically seed/verify credentials in users collection on DB connection
    await ensureUsersSeeded();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}
