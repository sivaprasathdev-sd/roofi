import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  id: string;
  name: string;
  code: string;
  description: string;
}

const RoleSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
