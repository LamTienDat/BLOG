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
/**
 * @swagger
 * /blog:
 *   post:
 *     summary: Create a new blog
 *     description: Create a new blog post with the provided title and content. Requires authentication.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the blog.
 *               content:
 *                 type: string
 *                 description: The content of the blog.
 *     responses:
 *       '201':
 *         description: Blog created successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: Blog created successfully
 *       '401':
 *         description: Unauthorized. User not logged in.
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized - User not logged in
 *       '400':
 *         description: Bad Request. Missing title or content.
 *         content:
 *           application/json:
 *             example:
 *               message: Title and content are required
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */

router.post("/", authorize(["admin", "user"]), createBlog);

/**
 * @swagger
 * /blog/get-all:
 *   get:
 *     summary: Get a list of blogs with optional pagination and search.
 *     description: Retrieve a paginated list of blogs with optional search by title. Requires authentication.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         description: The page number for pagination.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: title
 *         description: The title to search for.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of blogs.
 *         content:
 *           application/json:
 *             example:
 *               - _id: "60a59d6a66ad05794c3b773d"
 *                 title: "Sample Blog 1"
 *                 content: "This is the content of the sample blog 1."
 *                 state: 1
 *               - _id: "60a59d6a66ad05794c3b773e"
 *                 title: "Sample Blog 2"
 *                 content: "This is the content of the sample blog 2."
 *                 state: 1
 *       '400':
 *         description: Bad Request. Invalid page or other parameters.
 *         content:
 *           application/json:
 *             example:
 *               message: "Page cannot be greater than total page"
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */

// Get all blogs
router.get("/get-all", authorize(["admin", "user"]), getAllBlogs);

/**
 * @swagger
 * /blog/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     description: Retrieve a blog by its ID. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the requested blog.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized. User account needs to be verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your account needs to be verified.
 *       404:
 *         description: Blog not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog not found.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */

// Get blog by ID
router.get("/:id", authorize(["admin", "user"]), getBlogById);

/**
 * @swagger
 * /blog/{id}:
 *   put:
 *     summary: Update a blog by ID
 *     description: Update a blog by its ID. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response after updating the blog.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog updated successfully
 *       401:
 *         description: Unauthorized. User account needs to be verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your account needs to be verified.
 *       404:
 *         description: Blog not found or Title and content are required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog not found
 *       400:
 *         description: Invalid state.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid state
 *       403:
 *         description: Forbidden. User doesn't have permission to update the blog.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You can't update this blog with your access!
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */
// Update blog by ID
router.put("/:id", authorize(["admin", "user"]), updateBlog);

/**
 * @swagger
 * /blog/{id}:
 *   delete:
 *     summary: Delete a blog by ID
 *     description: Delete a blog by its ID. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response after deleting the blog.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog deleted successfully
 *       401:
 *         description: Unauthorized. User account needs to be verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your account needs to be verified.
 *       404:
 *         description: Blog not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog not found
 *       403:
 *         description: Forbidden. User doesn't have permission to delete the blog.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You can't delete this blog with your access!
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */

// Delete blog by ID
router.delete("/:id", authorize(["admin", "user"]), deleteBlog);

/**
 * @swagger
 * /blog/delete-all:
 *   delete:
 *     summary: Delete all blogs
 *     description: Delete all blogs. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response after deleting all blogs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deleted all Blogs
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */

router.post("/delete-all", authorize(["admin"]), deleteAllBlog);

/**
 * @swagger
 * /blog/export-csv:
 *   post:
 *     summary: Export blogs to CSV
 *     description: Export blogs to a CSV file. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response after exporting blogs to CSV.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */

router.post("/export-csv", authorize(["admin", "user"]), exportCsv);

/**
 * @swagger
 * /blog/import-csv:
 *   post:
 *     summary: Import blogs from CSV
 *     description: Import blogs from a CSV file. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The csv file.
 *     responses:
 *       200:
 *         description: Successful response after importing blogs from CSV.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: CSV data imported successfully
 *       400:
 *         description: Bad Request. No file uploaded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file uploaded.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */

router.post(
  "/import-csv",
  upload.single("file"),
  authorize(["admin"]),
  importCsv
);

/**
 * @swagger
 * /blog/{id}/like:
 *   post:
 *     summary: Like or unlike a blog
 *     description: Like or unlike a blog by its ID. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to like or unlike.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response after liking or unliking the blog.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Liked or Like cancelled
 *       401:
 *         description: Unauthorized. User account needs to be verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your account needs to be verified.
 *       404:
 *         description: Blog not found or Undefine blog or Undefine userRecord.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog not found or Undefine blog or Undefine userRecord.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */

router.post("/:id/like/", authorize(["admin", "user"]), likeBlog);

/**
 * @swagger
 * /api/blog/{id}/dislike:
 *   post:
 *     summary: Dislike or undislike a blog
 *     description: Dislike or undislike a blog by its ID. Requires authentication and account verification.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to dislike or undislike.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response after disliking or undisliking the blog.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Disliked or Dislike cancelled
 *       401:
 *         description: Unauthorized. User account needs to be verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your account needs to be verified.
 *       404:
 *         description: Blog not found or Undefine blog or Undefine userRecord.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog not found or Undefine blog or Undefine userRecord.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 */

router.post("/:id/dislike/", authorize(["admin", "user"]), dislikeBlog);

router.get("/api/blogs/count", updateBlogCount);

export default router;
