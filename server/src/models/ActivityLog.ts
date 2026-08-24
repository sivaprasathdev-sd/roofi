import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  id: string;
  at: string;
  user: string;
  role: "ho" | "state" | "cluster";
  action: string;
  module: string;
  record: string;
  description: string;
  ip: string;
  leadId?: string;
  stateId?: string;
  clusterId?: string;
}

const ActivityLogSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    at: { type: String, required: true },
    user: { type: String, required: true },
    role: { type: String, enum: ["ho", "state", "cluster"], required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    record: { type: String, required: true },
    description: { type: String, required: true },
    ip: { type: String, required: true },
    leadId: { type: String },
    stateId: { type: String },
    clusterId: { type: String },
  },
  { timestamps: true },
);

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
