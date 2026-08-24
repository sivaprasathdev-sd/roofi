import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  address: string;
  stateId: string;
  clusterId: string;
  leadId: string;
  quotations: number;
  invoices: number;
  purchaseValue: number;
  status: "Active" | "Inactive";
  createdDate: string;
}

const CustomerSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    stateId: { type: String, required: true },
    clusterId: { type: String, required: true },
    leadId: { type: String, required: true },
    quotations: { type: Number, default: 1 },
    invoices: { type: Number, default: 0 },
    purchaseValue: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdDate: { type: String, required: true },
  },
  { timestamps: true },
);

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
