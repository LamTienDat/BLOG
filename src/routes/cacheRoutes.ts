import express from "express";
import { getTest } from "../controllers/userController";
import { blogsCache } from "../controllers/blogController";
import { authorize } from "../middleware/authorize";
const router = express.Router();

router.get("/get-test", getTest);

router.post("/", authorize(["admin", "user"]), blogsCache);

export default router;
