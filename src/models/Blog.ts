// models/Blog.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface Blog extends Document {
    title: string;
    content: string;
    user: string | Schema.Types.ObjectId; // Reference to the User model
}

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
});

export default mongoose.model<Blog>('Blog', blogSchema);
