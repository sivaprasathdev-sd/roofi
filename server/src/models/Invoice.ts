import mongoose, { Schema, Document } from "mongoose";
import { DocItemSchema, IDocItem } from "./Quotation.js";

export interface IInvoice extends Document {
  id: string;
  customerId: string;
  clusterId: string;
  proformaId: string;
  date: string;
  dueDate: string;
  items: IDocItem[];
  paid: number;
  status: "Draft" | "Issued" | "Paid" | "Partially Paid" | "Pending" | "Cancelled";
  createdBy: string;
}

const InvoiceSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    clusterId: { type: String, required: true },
    proformaId: { type: String, required: true },
    date: { type: String, required: true },
    dueDate: { type: String, required: true },
    items: { type: [DocItemSchema], required: true },
    paid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Draft", "Issued", "Paid", "Partially Paid", "Pending", "Cancelled"],
      default: "Issued",
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
