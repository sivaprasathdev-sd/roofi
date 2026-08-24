import mongoose, { Schema, Document } from "mongoose";

export interface ICluster extends Document {
  id: string;
  name: string;
  code: string;
  stateId: string;
  company: string;
  address: string;
  gst: string;
  phone: string;
  email: string;
  manager: string;
}

const ClusterSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    stateId: { type: String, required: true },
    company: { type: String, required: true },
    address: { type: String, required: true },
    gst: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    manager: { type: String, required: true },
  },
  { timestamps: true },
);

export const Cluster = mongoose.model<ICluster>("Cluster", ClusterSchema);
