import express from "express";
import { cacheUsers, getTest } from "../controllers/userController";
import { blogsCache } from "../controllers/blogController";
import { authorize } from "../middleware/authorize";
const router = express.Router();

router.get("/get-test", getTest);

router.post("/blog", authorize(["admin", "user"]), blogsCache);
router.post("/user", authorize(["admin"]), cacheUsers);

export default router;
