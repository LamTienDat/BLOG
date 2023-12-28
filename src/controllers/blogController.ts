// blogController.ts
import { Response } from "express";
import Blog from "../models/Blog";
import User from "../models/User";
import { RequestCustom } from "../../types/express";
import * as fastCsv from "fast-csv";
import csvtojson from "csvtojson";
import fs from "fs";
import cron from "node-cron";
import { myCache } from "../app";
import {
  blogsCacheService,
  createBlogService,
  deleteAllBlogService,
  deleteBlogService,
  dislikeBlogService,
  exportCsvService,
  getAllBlogsService,
  getBlogByIdService,
  importCsvService,
  likeBlogService,
  updateBlogService,
} from "../service/blogService";

// Create a new blog
export const createBlog = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await createBlogService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllBlogs = async (req: RequestCustom, res: Response) => {
  try {
    const rs = getAllBlogsService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get blog by ID
export const getBlogById = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await getBlogByIdService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update blog by ID
export const updateBlog = async (req: RequestCustom, res: Response) => {
  try {
    const rs = updateBlogService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete blog by ID
export const deleteBlog = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await deleteBlogService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAllBlog = async (res: Response) => {
  try {
    const rs = await deleteAllBlogService(res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const likeBlog = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await likeBlogService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const dislikeBlog = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await dislikeBlogService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const exportCsv = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await exportCsvService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const importCsv = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await importCsvService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const blogsCache = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await blogsCacheService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

export const updateBlogCount = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const countToday = await Blog.countDocuments({
      createdAt: { $gte: today },
    });
    const countAll = await Blog.countDocuments({});

    console.log(`Number of blogs created today: ${countToday}`);
    console.log(`Number of blogs created: ${countAll}`);
  } catch (error) {
    console.error("Error updating blog count:", error);
  }
};

// Hàm tự động cập nhật cache sau mỗi khoảng thời gian
export const updateAllBlogsCache = async () => {
  try {
    const allBlogs = await Blog.find();
    myCache.set("allBlogs", allBlogs);
    console.log('Cache "allBlogs" updated successfully.');
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

cron.schedule("*/10 * * * *", async () => {
  console.log("Running task every 10 minutes...");
  await updateAllBlogsCache();
});

//Count so blog duoc tao ra trong ngay vao luc 0h00
cron.schedule("*/10 * * * *", async () => {
  console.log("Running task every 10 minutes...");
  await updateBlogCount();
});
