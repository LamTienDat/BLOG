// app.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import blogRoutes from "./routes/blogRoutes";
import dotenv from "dotenv";
import { authenticate } from "./middleware/authMiddleware";
import cacheRoutes from "./routes/cacheRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_DB_URI;
export const mymail = process.env.gmail;
export const password = process.env.password;
if (!mongoURI) {
  console.error("MONGO_DB_URI is not defined in the environment variables.");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

// Import Swagger UI Express
import swaggerUi from "swagger-ui-express";
import specs from "./swaggerConfig";

// Add Swagger Middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions);

const NodeCache = require("node-cache");
// export const myCache = new NodeCache();
export const CACHE_TTL = 600;
export const myCache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: CACHE_TTL + 120,
});

app.use("/auth", authRoutes);
app.use("/user", authenticate, userRoutes);
app.use("/blog", authenticate, blogRoutes);
app.use("/cache", authenticate, cacheRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
