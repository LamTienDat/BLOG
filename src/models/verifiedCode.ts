import mongoose, { Document, Schema } from "mongoose";

export interface verifiedCode extends Document {
  userId: string | Schema.Types.ObjectId;
  code: string;
}

const verifiedCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model<verifiedCode>("verifiedCode", verifiedCodeSchema);
