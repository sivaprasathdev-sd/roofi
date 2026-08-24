import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distIndex = path.resolve(__dirname, "./dist/index.js");

if (!fs.existsSync(distIndex)) {
  console.error(
    "❌ Production server build not found!"
  );
  console.error(
    "Please run 'npm run build' inside the server directory."
  );

  process.exit(1);
}

console.log("==========================================");
console.log("🚀 Starting Roofi Server");
console.log("==========================================");
console.log(`Environment : ${process.env.NODE_ENV || "development"}`);
console.log(`Port        : ${process.env.PORT || 5039}`);
console.log(`Base URL    : ${process.env.BASE_URL || "Not configured"}`);
console.log(`MongoDB     : ${process.env.MONGO_URI || "Not configured"}`);
console.log("==========================================");

// Start compiled TypeScript application
import("./dist/index.js").catch((error) => {
  console.error("❌ Failed to start compiled server:");
  console.error(error);
  process.exit(1);
});