// app.ts
import express, { NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import blogRoutes from "./routes/blogRoutes";
import dotenv from "dotenv";
import { authenticate } from "./middleware/authMiddleware";
import testRoutes from "./routes/cacheRoutes";
import cacheRoutes from "./routes/cacheRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT;
const mongoURI = process.env.MONGO_DB_URI;
export const mymail = process.env.gmail;
export const password = process.env.password;
if (!mongoURI) {
  console.error("MONGO_DB_URI is not defined in the environment variables.");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions);

app.use("/auth", authRoutes);
app.use("/user", authenticate, userRoutes);
app.use("/blog", authenticate, blogRoutes);
app.use("/cache", authenticate, cacheRoutes);

export const redis = require("redis");

// create and connect redis client to local instance.
export const client = redis.createClient(REDIS_PORT);

// client.connect();

const NodeCache = require("node-cache");
// export const myCache = new NodeCache();
export const CACHE_TTL = 600;
export const myCache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: CACHE_TTL + 120,
});

// echo redis errors to the console
client.on("error", (err: any) => {
  console.log("Error " + err);
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
