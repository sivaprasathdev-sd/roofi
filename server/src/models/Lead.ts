import mongoose, { Schema, Document } from "mongoose";

export interface ITimelineEntry {
  label: string;
  at: string;
  by: string;
  note?: string;
}

export interface ILead extends Document {
  id: string;
  customerName: string;
  phone: string;
  altPhone?: string;
  email: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  stateId: string;
  clusterId?: string;
  source: string;
  campaign: string;
  status: string;
  priority: string;
  product: string;
  quantity: number;
  estValue: number;
  assignedBy: string;
  assignedDate?: string;
  lastContact?: string;
  nextFollowUp?: string;
  createdDate: string;
  notes: string;
  timeline: ITimelineEntry[];
}

const TimelineSchema = new Schema(
  {
    label: { type: String, required: true },
    at: { type: String, required: true },
    by: { type: String, required: true },
    note: { type: String },
  },
  { _id: false },
);

const LeadSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    pincode: { type: String, required: true },
    stateId: { type: String, required: true },
    clusterId: { type: String },
    source: { type: String, required: true },
    campaign: { type: String, required: true },
    status: { type: String, required: true },
    priority: { type: String, required: true },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    estValue: { type: Number, required: true },
    assignedBy: { type: String, default: "—" },
    assignedDate: { type: String },
    lastContact: { type: String },
    nextFollowUp: { type: String },
    createdDate: { type: String, required: true },
    notes: { type: String, default: "" },
    timeline: { type: [TimelineSchema], default: [] },
  },
  { timestamps: true },
);

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
