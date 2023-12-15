// blogController.ts
import { Request, Response } from 'express';
import Blog from '../models/Blog';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../utils/jwtUtil';


// Create a new blog
export const createBlog = async (req: Request, res: Response) => {
    const { title, content } = req.body;
    if(!title || !content) {
        return res.status(401).json({ message: 'Title and content are required' });
    }
    try {
        // Verify the JWT token
        const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is in the "Bearer <token>" format

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - User not logged in' });
        }

        const decodedToken: any = jwt.verify(token, jwtSecret);

        if (!decodedToken.userId) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

        // Check if the user exists
        const userExists = await User.exists({ _id: decodedToken.userId });

        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new blog associated with the logged-in user
        const newBlog = new Blog({ title, content, user: decodedToken.userId });
        await newBlog.save();

        res.status(201).json({ message: 'Blog created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get all blogs
export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get blog by ID
export const getBlogById = async (req: Request, res: Response) => {
    const blogId = req.params.id;
    if(!blogId) {
        return res.status(404).json({ message: 'BlogId is required' });
    }
    try {
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update blog by ID
export const updateBlog = async (req: Request, res: Response) => {
    const blogId = req.params.id;
    const { title, content } = req.body;
    if(title === "" || content === "") {
        return res.status(404).json({ message: 'Title and content are required' });
    }
    if(!blogId) {
        return res.status(404).json({ message: 'BlogId is required' });
    }
    try {
        // Check if the blog exists
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Verify the JWT token
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - User not logged in' });
        }

        const decodedToken: any = jwt.verify(token, jwtSecret);

        if (!decodedToken.userId) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

        // Check if the user ID associated with the blog matches the user ID from the token
        if (blog.user.toString() !== decodedToken.userId) {
            return res.status(403).json({ message: 'You are not allowed to update this blog' });
        }

        // Update blog data
        blog.title = title;
        blog.content = content;
        await blog.save();

        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete blog by ID
export const deleteBlog = async (req: Request, res: Response) => {
    const blogId = req.params.id;
    if(!blogId) {
        return res.status(404).json({ message: 'BlogId is required' });
    }
    try {
        // Check if the blog exists
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Verify the JWT token
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - User not logged in' });
        }

        const decodedToken: any = jwt.verify(token, jwtSecret);

        if (!decodedToken.userId) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

        // Check if the user ID associated with the blog matches the user ID from the token
        if (blog.user.toString() !== decodedToken.userId) {
            return res.status(403).json({ message: 'Forbidden - You are not allowed to update this blog' });
        }

        // Delete the blog
        await blog.deleteOne();

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
