import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTest,
} from "../controllers/userController";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/uploadMiddleware";
import { adminCreateUser } from "../controllers/userController";

const router = express.Router();
// Get all users
router.get("/", authorize(["admin"]), getAllUsers);

// Get user by ID
router.get("/:id", authorize(["admin", "user"]), getUserById);

// Update user by ID
router.put("/:id", authorize(["admin", "user"]), updateUser);

// Delete user by ID
router.delete("/:id", authorize(["admin", "user"]), deleteUser);

router.post(
  "/admin",
  authorize(["admin"]),
  upload.single("avatar"),
  adminCreateUser
);

router.get("/redis", getTest);

export default router;
