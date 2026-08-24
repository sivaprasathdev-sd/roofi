import mongoose, { Schema, Document } from "mongoose";
import { DocItemSchema, IDocItem } from "./Quotation.js";

export interface IProforma extends Document {
  id: string;
  customerId: string;
  stateId: string;
  clusterId: string;
  quotationId: string;
  date: string;
  dueDate: string;
  logo?: string;
  companyTitle?: string;
  companyAddress?: string;
  companyGst?: string;
  companyPhone?: string;
  companyEmail?: string;
  footerTerms?: string;
  items: IDocItem[];
  status: "Draft" | "Issued" | "Converted" | "Cancelled";
  createdBy: string;
}

const ProformaSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    stateId: { type: String, required: true },
    clusterId: { type: String, required: true },
    quotationId: { type: String, required: true },
    date: { type: String, required: true },
    dueDate: { type: String, required: true },
    logo: { type: String },
    companyTitle: { type: String },
    companyAddress: { type: String },
    companyGst: { type: String },
    companyPhone: { type: String },
    companyEmail: { type: String },
    footerTerms: { type: String },
    items: { type: [DocItemSchema], required: true },
    status: {
      type: String,
      enum: ["Draft", "Issued", "Converted", "Cancelled"],
      default: "Issued",
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Proforma = mongoose.model<IProforma>("Proforma", ProformaSchema);
