
import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
} from '../controllers/blogController';

const router = express.Router();

// Create a new blog
router.post('/', createBlog);

// Get all blogs
router.get('/', getAllBlogs);

// Get blog by ID
router.get('/:id', getBlogById);

// Update blog by ID
router.put('/:id', updateBlog);

// Delete blog by ID
router.delete('/:id', deleteBlog);

export default router;