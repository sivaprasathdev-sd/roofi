import fs from "fs";
import path from "path";
import { Request } from "express";

export function getUploadsDir(): string {
  if (process.env.UPLOAD_DIR) {
    const customDir = path.resolve(process.env.UPLOAD_DIR);
    if (!fs.existsSync(customDir)) {
      fs.mkdirSync(customDir, { recursive: true });
    }
    return customDir;
  }

  const cwdUploads = path.resolve(process.cwd(), "uploads");
  const parentUploads = path.resolve(process.cwd(), "../uploads");

  let targetDir = cwdUploads;
  if (fs.existsSync(parentUploads) && !fs.existsSync(cwdUploads)) {
    targetDir = parentUploads;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  return targetDir;
}

export function buildPublicFileUrl(req: Request | undefined, filename: string): string {
  const baseUrl = process.env.BASE_URL;
  if (baseUrl) {
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/uploads/${filename}`;
  }

  if (req) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host") || "roofi.asnroofings.com:5039";
    return `${protocol}://${host}/uploads/${filename}`;
  }

  return `/uploads/${filename}`;
}
