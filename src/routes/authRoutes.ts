// authRoutes.ts
import express from "express";
import { login, logout, verifyAccount } from "../controllers/authController";
import { createUser } from "../controllers/authController";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Route for user login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *       '401':
 *         description: Unauthorized
 */
router.post("/login", login);

router.post("/logout", logout);
/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided information.
 *     tags:
 *      [Authentication]
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
 *       '201':
 *         description: User created successfully. Verification code sent.
 *         content:
 *           application/json:
 *             example:
 *               message: User created successfully. We have sent you a secret code, please verify it !!!
 *       '400':
 *         description: Bad Request. Invalid file format or missing required fields.
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid file format. Only jpg, jpeg, and png are allowed.
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */
router.post("/", upload.single("avatar"), createUser);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify user account
 *     description: Verify user account with the provided userId and verification code.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: objectId
 *                 description: The unique identifier of the user.
 *               code:
 *                 type: string
 *                 description: The verification code sent to the user.
 *     responses:
 *       '200':
 *         description: User account verified successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: Account verified !
 *       '400':
 *         description: Bad Request. Missing userId or code.
 *         content:
 *           application/json:
 *             example:
 *               message: Please fill userId and code !!!
 *       '404':
 *         description: Not Found. Invalid user or expired verification code.
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid user
 *       '405':
 *         description: Not Found. Invalid userID.
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid user
 */
router.post("/verify", verifyAccount);

export default router;
