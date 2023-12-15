// User.ts
import mongoose, { Document } from 'mongoose';

export interface User extends Document {
    username: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

export default mongoose.model<User>('User', userSchema);
