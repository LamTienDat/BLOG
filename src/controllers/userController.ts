// userController.ts
import { Request, Response } from 'express';
import User from '../models/User';

import bcrypt from 'bcrypt';
import Blog from '../models/Blog';

// Create a new user
export const createUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        // Check if both username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}, '-password'); // Exclude the password field
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId, '-password'); // Exclude the password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update user by ID
export const updateUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user data
        user.username = username;
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete user by ID
export const deleteUser = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        // Check if the user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        await user.deleteOne();
        await Blog.deleteMany({ user: user._id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
