import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  exportCsv,
  importCsv,
  deleteAllBlog,
  updateBlogCount,
} from "../controllers/blogController";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Create a new blog
router.post("/", authorize(["admin", "user"]), createBlog);

// Get all blogs
router.get("/get-all", authorize(["admin", "user"]), getAllBlogs);

// Get blog by ID
router.get("/:id", authorize(["admin", "user"]), getBlogById);

// Update blog by ID
router.put("/:id", authorize(["admin", "user"]), updateBlog);

// Delete blog by ID
router.delete("/:id", authorize(["admin", "user"]), deleteBlog);

router.post("/delete-all", authorize(["admin"]), deleteAllBlog);

router.post("/export-csv", authorize(["admin", "user"]), exportCsv);

router.post(
  "/import-csv",
  upload.single("file"),
  authorize(["admin"]),
  importCsv
);

router.post("/:id/like/", authorize(["admin", "user"]), likeBlog);

router.post("/:id/dislike/", authorize(["admin", "user"]), dislikeBlog);

router.get("/api/blogs/count", updateBlogCount);

export default router;
