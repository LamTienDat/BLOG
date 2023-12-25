// authRoutes.ts
import express from "express";
import { login, logout, verifyAccount } from "../controllers/authController";
import { createUser } from "../controllers/authController";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Route for user login
router.post("/login", login);

router.post("/logout", logout);

router.post("/", upload.single("avatar"), createUser);

router.post("/verify", verifyAccount);

export default router;
