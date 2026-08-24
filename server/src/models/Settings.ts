import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  stateId?: string;
  clusterId?: string;
  projectTitle: string;
  logoUrl?: string;
  icoUrl?: string;
  companyName: string;
  gstNumber: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  currency: string;
  footerTerms?: string;
}

const SettingsSchema: Schema = new Schema(
  {
    stateId: { type: String },
    clusterId: { type: String },
    projectTitle: { type: String, default: "ROOFI STONE COATED METAL TILE" },
    logoUrl: { type: String, default: "" },
    icoUrl: { type: String, default: "" },
    companyName: { type: String, default: "ROOFI Roofing Solutions Pvt Ltd" },
    gstNumber: { type: String, default: "29AABCR1234K1Z0" },
    supportEmail: { type: String, default: "support@roofi.in" },
    supportPhone: { type: String, default: "+91 98400 11223" },
    address: { type: String, default: "Headquarters, Industrial Estate, Chennai, India" },
    currency: { type: String, default: "INR (₹)" },
    footerTerms: {
      type: String,
      default:
        "1. 50% Advance with order confirmation, 50% before dispatch.\n2. Prices inclusive of GST as applicable.\n3. Goods once sold will not be taken back.",
    },
  },
  { timestamps: true },
);

export const SettingsModel = mongoose.model<ISettings>("Settings", SettingsSchema);
