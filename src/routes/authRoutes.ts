// authRoutes.ts
import express from 'express';
import { login, logout } from '../controllers/authController';

const router = express.Router();

// Route for user login
router.post('/login', login);

router.post('/logout', logout);

export default router;
