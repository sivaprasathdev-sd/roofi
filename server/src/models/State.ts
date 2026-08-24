import mongoose, { Schema, Document } from "mongoose";

export interface IState extends Document {
  id: string;
  name: string;
  code: string;
}

const StateSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
  },
  { timestamps: true },
);

export const State = mongoose.model<IState>("State", StateSchema);
