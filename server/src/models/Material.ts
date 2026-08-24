import mongoose, { Schema, Document } from "mongoose";

export interface IMaterial extends Document {
  id: string;
  name: string;
  fileUrl: string;
  fileName: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
}

const MaterialSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    type: { type: String, required: true },
    category: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    uploadDate: { type: String, required: true },
    size: { type: String, required: true },
  },
  { timestamps: true },
);

export const Material = mongoose.model<IMaterial>("Material", MaterialSchema);
