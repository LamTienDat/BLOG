import mongoose, { Document } from "mongoose";

export interface User extends Document {
  username: string;
  password: string;
  role: string;
  profileImage: {
    data: Buffer;
  };
  firstName: string;
  lastName: string;
  email: string;
  birthDate: number;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  likedPosts: mongoose.Types.ObjectId[];
  dislikedPosts: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  profileImage: {
    data: Buffer,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  birthDate: { type: Number, required: true },
  address: { type: String },
  createdAt: { type: Date, required: true, default: Date.now() },
  updatedAt: { type: Date, require: true, default: Date.now() },
  isVerified: { type: Boolean, require: true },
  likedPosts: [{ type: mongoose.Types.ObjectId, ref: "Blog" }],
  dislikedPosts: [{ type: mongoose.Types.ObjectId, ref: "Blog" }],
});

export default mongoose.model<User>("User", userSchema);
