// authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../utils/jwtUtil';

const revokedTokens: string[] = [];

export const addToBlacklist = (token: string) => {
    revokedTokens.push(token);
};

export const isTokenRevoked = (token: string) => {
    return revokedTokens.includes(token);
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the entered password with the hashed password from the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the token is revoked
    if (isTokenRevoked(token)) {
        return res.status(401).json({ message: 'Token has been revoked' });
    }

    // Add the token to the blacklist
    addToBlacklist(token);

    // Respond with a success message
    res.json({ message: 'Logout successful' });
};
