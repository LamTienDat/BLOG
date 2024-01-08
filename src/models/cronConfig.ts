import mongoose, { Document } from "mongoose";

export interface CronConfig extends Document {
  updateCache: string;
  updateCountBlog: string;
  updateCountUser: string;
  createdAt: Date;
  updatedAt: Date;
}

const cronSchema = new mongoose.Schema({
  updateCache: { type: String, required: true },
  updateCountBlog: { type: String, required: true },
  updateCountUser: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
  updatedAt: { type: Date, required: true, default: Date.now() },
});

export default mongoose.model<CronConfig>("CronConfig", cronSchema);
