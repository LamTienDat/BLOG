import mongoose, { Schema, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
export interface Blog extends Document {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  state: number;
  like: number;
  dislike: number;
  author: string | Schema.Types.ObjectId;
  likesInfo: mongoose.Types.ObjectId[];
  dislikesInfo: mongoose.Types.ObjectId[];
}

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
  updatedAt: { type: Date, required: true, default: Date.now() },
  state: { type: Number, required: true, default: 1 },
  like: { type: Number, required: true, default: 0 },
  dislike: { type: Number, required: true, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  likesInfo: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  dislikesInfo: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

blogSchema.plugin(mongoosePaginate);

export default mongoose.model<Blog>("Blog", blogSchema);
