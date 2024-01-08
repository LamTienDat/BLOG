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
import cronConfig from "../models/cronConfig";

// Create a new blog
export const createBlog = async (req: RequestCustom, res: Response) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(401).json({ message: "Title and content are required" });
  }
  try {
    const user = req.user.user;
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not logged in" });
    }
    const newBlog = new Blog({ title, content, author: user._id });
    await newBlog.save();
    updateAllBlogsCache();
    return res.status(201).json({ message: "Blog created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update cache after action
export const updateAllBlogsCache = async () => {
  try {
    const allBlogs = await Blog.find();
    myCache.set("allBlogs", allBlogs);
    const totalBlogs = await Blog.countDocuments();
    myCache.set("totalBlogs", totalBlogs);
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

export const getAllBlogs = async (req: RequestCustom, res: Response) => {
  try {
    const page = req.query.page;
    const pageSize = req.query.pageSize;

    if (!page) return res.json("Please input page");

    const blogTitle = req.query.title;
    const pageString: string = page as string;
    const pageSizeString: string = pageSize as string;
    let totalBlogs;

    if (myCache.has("totalBlogs")) {
      totalBlogs = myCache.get("totalBlogs");
    }

    totalBlogs = await Blog.countDocuments();
    myCache.set("totalBlogs", totalBlogs);

    const totalPages = Math.ceil(totalBlogs / parseInt(pageSizeString));

    if (parseInt(pageString) > totalPages) {
      return res.json({ message: "Page cannot be greater than total page" });
    }

    const skip = (parseInt(pageString) - 1) * parseInt(pageSizeString);

    let query: any = {};
    if (blogTitle && typeof blogTitle === "string") {
      const regex = new RegExp(blogTitle, "i");
      query =
        req.user.user.role === "user"
          ? { state: 1, title: regex }
          : { title: regex };
    } else if (!blogTitle && typeof blogTitle === "string") {
      query = req.user.user.role === "admin" ? {} : { state: 1 };
    }

    let allBlogs = myCache.get("allBlogs");

    if (allBlogs == null) {
      allBlogs = await Blog.find(query)
        .sort("_id")
        .skip(Math.max(0, skip))
        .limit(parseInt(pageSizeString));
    } else {
      allBlogs = allBlogs
        .filter((blog: any) => {
          if (typeof blogTitle === "string") {
            return blog.title.match(new RegExp(blogTitle, "i"));
          }
          return true;
        })
        .sort((blog: any, nextBlog: any) => blog._id - nextBlog._id)
        .slice(Math.max(0, skip), Math.max(0, skip) + parseInt(pageSizeString));
    }
    await updateAllBlogsCache();
    return res.json(allBlogs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get blog by ID
export const getBlogById = async (req: RequestCustom, res: Response) => {
  try {
    const blogId = req.params.id;
    if (!blogId) {
      return res.status(404).json({ message: "BlogId is required" });
    }

    // Check cache
    const allBlogs = myCache.get("allBlogs");

    if (allBlogs) {
      const blog = allBlogs.find((blog: any) => blog._id.toString() === blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      if (req.user.user.role === "admin") {
        return res.json(blog);
      } else {
        if (blog.state != 1) {
          return res.status(404).json({ message: "Blog not found" });
        }
        return res.json(blog);
      }
    }

    // Cache miss, query DB
    if (req.user.user.role === "admin") {
      const blog = await Blog.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      const all = await Blog.find();
      myCache.set("allBlogs", all);
      return res.json(blog);
    } else {
      const blog = await Blog.findOne({ _id: blogId, state: 1 });
      const all = await Blog.find();

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      myCache.set("allBlogs", all);
      return res.json(blog);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update blog by ID
export const updateBlog = async (req: RequestCustom, res: Response) => {
  try {
    const blogId = req.params.id;
    const author = req.user.user._id;
    const { title, content } = req.body;
    if (title === "" || content === "") {
      return res
        .status(404)
        .json({ message: "Title and content are required" });
    }
    if (!blogId) {
      return res.status(404).json({ message: "BlogId is required" });
    }
    // Check if the blog exists
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const currentTimeStamp: number = Date.now();
    const currentDate: Date = new Date(currentTimeStamp);
    if (req.user.user.role == "admin" || author == blog.author) {
      blog.title = title;
      blog.content = content;
      blog.updatedAt = currentDate;
      await blog.save();
      await updateAllBlogsCache();
      return res.json({ message: "Blog updated successfully" });
    }
    return res.json({
      message: "You cant update this blog with your access !",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete blog by ID
export const deleteBlog = async (req: RequestCustom, res: Response) => {
  try {
    const blogId = req.params.id;
    const author = req.user.user._id;
    if (!blogId) {
      return res.status(404).json({ message: "BlogId is required" });
    }
    // Check if the blog exists
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    if (req.user.user.role == "admin" || author == blog.author) {
      await blog.deleteOne();
      await updateAllBlogsCache();
      return res.json({ message: "Blog deleted successfully" });
    }
    return res.json({
      message: "You cant delete this blog with your access !",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAllBlog = async (req: RequestCustom, res: Response) => {
  try {
    await Blog.deleteMany();
    await updateAllBlogsCache();
    return res.json("Deleted all Blogs ");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const likeBlog = async (req: RequestCustom, res: Response) => {
  try {
    const user = req.user.user;
    const blogId = req.params.id;
    if (!blogId) {
      return res.status(404).json({ message: "BlogId is required" });
    }
    const blog = await Blog.findById(blogId);
    console.log("blog type: ", typeof blog);

    const userRecord = await User.findById(user._id);
    if (!blog) {
      return res.status(404).json({ message: "Undefine blog !" });
    }
    if (!userRecord) {
      return res.status(404).json({ message: "Undefine userRecord !" });
    }

    const hasLiked = userRecord.likedPosts.findIndex((postId) =>
      postId.equals(blog._id)
    );
    if (hasLiked == -1) {
      userRecord.likedPosts.push(blog._id);
      blog.likesInfo.push(userRecord._id);
      blog.like += 1;
      await blog.save();
      await userRecord.save();
      const allBlogs = await Blog.find();
      myCache.set("allBlogs", allBlogs);
      return res.json({ message: "Liked" });
    }
    const index = userRecord.likedPosts.indexOf(blog._id);
    if (index !== -1) {
      userRecord.likedPosts = userRecord.likedPosts.filter(
        (element) => !element.equals(blog._id)
      );
      blog.likesInfo = blog.likesInfo.filter(
        (element) => !element.equals(user._id)
      );
      blog.like -= 1;
      await blog.save();
      await userRecord.save();
      const allBlogs = await Blog.find();
      myCache.set("allBlogs", allBlogs);
      return res.json({ message: "Like cancelled" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const dislikeBlog = async (req: RequestCustom, res: Response) => {
  try {
    const user = req.user.user;
    const blogId = req.params.id;
    if (!blogId) {
      return res.status(404).json({ message: "BlogId is required" });
    }
    const blog = await Blog.findById(blogId);

    const userRecord = await User.findById(user._id);
    if (!blog) {
      return res.status(404).json({ message: "Undefine blog !" });
    }
    if (!userRecord) {
      return res.status(404).json({ message: "Undefine userRecord !" });
    }

    const hasDisliked = userRecord.dislikedPosts.findIndex((postId) =>
      postId.equals(blog._id)
    );
    if (hasDisliked == -1) {
      userRecord.dislikedPosts.push(blog._id);
      blog.dislikesInfo.push(userRecord._id);
      blog.dislike += 1;
      await blog.save();
      await userRecord.save();
      const allBlogs = await Blog.find();
      myCache.set("allBlogs", allBlogs);
      return res.json({ message: "Disliked" });
    }
    const index = userRecord.dislikedPosts.indexOf(blog._id);
    if (index !== -1) {
      userRecord.dislikedPosts = userRecord.dislikedPosts.filter(
        (element) => !element.equals(blog._id)
      );
      blog.dislikesInfo = blog.dislikesInfo.filter(
        (element) => !element.equals(user._id)
      );
      blog.dislike -= 1;
      await blog.save();
      await userRecord.save();
      const allBlogs = await Blog.find();
      myCache.set("allBlogs", allBlogs);
      return res.json({ message: "Dislike cancelled" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const exportCsv = async (req: RequestCustom, res: Response) => {
  try {
    let data;
    if (myCache.has("allBlogs")) {
      data = myCache.get("allBlogs");
    }

    const role = req.user.user.role;
    if (role === "admin") {
      data = await Blog.find();
      myCache.set("allBlogs", data);
    } else {
      data = await Blog.find({ state: 1 });
      const all = await Blog.find();
      myCache.set("allBlogs", all);
    }

    const csvStream = fastCsv.format({ headers: true });
    const writableStream = fs.createWriteStream("output.csv");
    csvStream.pipe(writableStream);

    data.forEach((item: any) => {
      const plainObject = item.toObject({ virtuals: true });
      delete plainObject.id;
      delete plainObject._id;
      csvStream.write(plainObject);
    });

    csvStream.end();
    res.status(200).send("Exported to CSV");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const importCsv = async (req: RequestCustom, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    if (req.file.mimetype !== "text/csv") {
      return res.status(400).send("Only CSV files are allowed.");
    }

    const existingUsers = await User.find({}, "_id");

    const csvString = req.file.buffer.toString("utf8");

    const jsonArray = await csvtojson().fromString(csvString);
    var ObjectId = require("mongodb").ObjectId;
    // Enrich JSON data with additional form data
    const enrichedData = jsonArray
      .filter((item) => {
        const authorId = new ObjectId(item.author);
        return existingUsers.some((user) => user._id.equals(authorId));
      })
      .map((item) => ({
        title: item.title,
        content: item.content,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        state: parseInt(item.state),
        like: parseInt(item.like),
        dislike: parseInt(item.dislike),
        author: new ObjectId(item.author),
        likesInfo: item.likesInfo ? [new ObjectId(item.likesInfo)] : [],
        dislikesInfo: item.dislikesInfo
          ? [new ObjectId(item.dislikesInfo)]
          : [],
        __v: parseInt(item.__v),
      }));

    // Import data into the MongoDB collection
    await Blog.insertMany(enrichedData);
    const allBlogs = await Blog.find();
    myCache.set("allBlogs", allBlogs);
    res.status(200).json({ message: "CSV data imported successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
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

export const blogsCache = async (req: RequestCustom, res: Response) => {
  try {
    const allBlogs = await Blog.find();
    myCache.set("allBlogs", allBlogs);
    const totalBlogs = await Blog.countDocuments();
    myCache.set("totalBlogs", totalBlogs);
    return res.json({ message: "Cache updated successfully." });
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};
