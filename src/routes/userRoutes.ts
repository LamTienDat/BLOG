import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/uploadMiddleware";
import { adminCreateUser } from "../controllers/userController";
import { postConfig } from "../controllers/configController";

const router = express.Router();

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users with pagination
 *     description: Retrieve a list of all users with pagination. Requires admin privileges.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         description: The page number for pagination.
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageSize
 *         required: true
 *         description: The pageSize for pagination.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request. Page parameter is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please input page or Page cannot be greater than total page.
 *       401:
 *         description: Unauthorized. Admin privileges required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin privileges required.
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

// Get all users
router.get("/", authorize(["admin"]), getAllUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve user details by providing the user ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user to retrieve
 *         required: true
 *         schema:
 *           type: string
 *         example: 5f75f1f94055d43a45b36ae2
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */

// Get user by ID
router.get("/:id", authorize(["admin", "user"]), getUserById);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update  user
 *     description: Update user with the provided information.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user to edit
 *         required: true
 *         schema:
 *           type: string
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               birthDate:
 *                 type: string
 *                 description: The birth date of the user.
 *               address:
 *                 type: string
 *                 description: The address of the user.
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The profile image file (JPG, JPEG, PNG).
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User updated successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */

// Update user by ID
router.put(
  "/:id",
  authorize(["admin", "user"]),
  upload.single("avatar"),
  updateUser
);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a user by providing the user ID. Only admins or the user themselves can delete the user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad Request. Invalid user ID format.
 *       403:
 *         description: Forbidden. The user does not have permission to delete this user.
 *       404:
 *         description: Not Found. User not found with the provided ID.
 *       500:
 *         description: Internal Server Error.
 */

// Delete user by ID
router.delete("/:id", authorize(["admin", "user"]), deleteUser);

/**
 * @swagger
 * /user/admin:
 *   post:
 *     summary: Admin create a new user
 *     description: Create a new user with the provided information.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               birthDate:
 *                 type: string
 *                 description: The birth date of the user.
 *               address:
 *                 type: string
 *                 description: The address of the user.
 *               role:
 *                 type: string
 *                 description: The role of the user "user" or "admin".
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The profile image file (JPG, JPEG, PNG).
 *     responses:
 *       201:
 *         description: Successful response after creating a new user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Bad Request. Invalid file format or required fields missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid file format or required fields missing.
 *       401:
 *         description: Unauthorized. Admin privileges required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin privileges required.
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
  "/admin",
  authorize(["admin"]),
  upload.single("avatar"),
  adminCreateUser
);

export default router;
