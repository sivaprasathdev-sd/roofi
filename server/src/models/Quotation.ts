import mongoose, { Schema, Document } from "mongoose";

export interface IDocItem {
  product: string;
  description: string;
  size: string;
  color: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
}

export interface IQuotation extends Document {
  id: string;
  customerId: string;
  stateId: string;
  clusterId: string;
  leadId: string;
  date: string;
  validUntil: string;
  logo?: string;
  companyTitle?: string;
  companyAddress?: string;
  companyGst?: string;
  companyPhone?: string;
  companyEmail?: string;
  footerTerms?: string;
  items: IDocItem[];
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  createdBy: string;
}

export const DocItemSchema = new Schema(
  {
    product: { type: String, required: true },
    description: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    qty: { type: Number, required: true },
    unit: { type: String, default: "Nos" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 18 },
  },
  { _id: false },
);

const QuotationSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    stateId: { type: String, required: true },
    clusterId: { type: String, required: true },
    leadId: { type: String, required: true },
    date: { type: String, required: true },
    validUntil: { type: String, required: true },
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
      enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
      default: "Sent",
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Quotation = mongoose.model<IQuotation>("Quotation", QuotationSchema);
