// seed.ts
import mongoose, { ConnectOptions } from "mongoose";
import User from "./models/User";
import Blog from "./models/Blog";
import bcrypt from "bcrypt";
import verifiedCode from "./models/verifiedCode";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGO_DB_URI?.trim();

if (!mongoURI) {
  console.error("MONGO_DB_URI is not defined in the environment variables.");
  process.exit(1);
}

async function seedDatabase() {
  const user = [
    {
      _id: "658b9a7a406483111a8e6cb2",
      username: "admin",
      password: await bcrypt.hash(process.env.defaultPassword!, 5),
      role: "admin",
      firstName: "Lam",
      lastName: "Dat",
      email: "admin@gmail.com",
      birthDate: 1014858357000,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
      likedPosts: [],
      dislikedPosts: [],
    },
    {
      _id: "658b9c9f6c98f3af1198d73a",
      username: "user",
      password: await bcrypt.hash(process.env.defaultPassword!, 5),
      role: "user",
      firstName: "user",
      lastName: "user",
      email: "user@gmail.com",
      birthDate: 1040953615,
      address: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
      likedPosts: [],
      dislikedPosts: [],
    },
  ];

  const blog = [
    {
      title: "Day la blog dau tien",
      content: "That tuyet voi",
      createdAt: new Date("2023-12-27T03:33:52.904Z"),
      updatedAt: new Date("2023-12-27T03:33:52.904Z"),
      state: 1,
      like: 0,
      dislike: 0,
      author: "658b9a7a406483111a8e6cb2",
      likesInfo: [],
      dislikesInfo: [],
    },
    {
      title: "Day la blog thu 2",
      content: "That tuyet voi lan nua",
      createdAt: new Date("2023-12-27T03:33:52.904Z"),
      updatedAt: new Date("2023-12-27T03:33:52.904Z"),
      state: 1,
      like: 0,
      dislike: 0,
      author: "658b9a7a406483111a8e6cb2",
      likesInfo: [],
      dislikesInfo: [],
    },
    {
      title: "Blog cua user",
      content: "User",
      createdAt: new Date("2023-12-27T03:41:57.579Z"),
      updatedAt: new Date("2023-12-27T03:41:57.579Z"),
      state: 1,
      like: 0,
      dislike: 0,
      author: "658b9c9f6c98f3af1198d73a",
      likesInfo: [],
      dislikesInfo: [],
    },
  ];
  try {
    await mongoose.connect(mongoURI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    await User.deleteMany({});
    await Blog.deleteMany({});
    await verifiedCode.deleteMany({});
    await User.insertMany(user);
    await Blog.insertMany(blog);
    console.log("Seeding complete");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
