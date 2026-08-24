import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: string;
  stateId?: string;
  clusterId?: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

const UserSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    stateId: { type: String },
    clusterId: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    lastLogin: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
