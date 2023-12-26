// userController.ts
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import Blog from "../models/Blog";
import mimeTypes from "mime-types";
import { RequestCustom } from "../../types/express";
import Jimp from "jimp";
import cron from "node-cron";
import { myCache } from "../app";
import validator from "validator";

export const adminCreateUser = async (req: RequestCustom, res: Response) => {
  const {
    username,
    password,
    firstName,
    lastName,
    email,
    birthDate,
    address,
    role,
  } = req.body;
  const user = req.user;

  const parsed = parseFloat(birthDate);
  if (
    !Number.isNaN(parsed) &&
    Number.isFinite(parsed) &&
    /^\d+\.?\d+$/.test(birthDate) != true
  ) {
    return res.status(400).json({
      message: "Bithdate must be timestamp",
    });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const file = req.file;
  if (!file) {
    return res.json("Invalid file");
  }
  const allowedExtensions = ["jpg", "jpeg", "png"];
  const fileExtension = mimeTypes.extension(file.mimetype);

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return res
      .status(400)
      .json("Invalid file format. Only jpg, jpeg, and png are allowed.");
  }
  if (role !== "user" || role !== "admin") {
    return res.status(400).json("Only have 2 role are user and admin");
  }

  try {
    if (!file) {
      return res.json("Invalid file");
    }
    // Sử dụng sharp để thực hiện nén ảnh
    // Resize and compress the image using jimp
    const compressedImageBuffer = await (
      await Jimp.read(file.buffer)
    )
      .resize(300, Jimp.AUTO) // Resize width to 300px, maintain aspect ratio
      .quality(80) // Set the compression quality (adjust as needed)
      .getBufferAsync(Jimp.MIME_JPEG);
    const image = {
      data: compressedImageBuffer,
    };

    // Check if both username and password are provided
    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !email ||
      !birthDate ||
      !role
    ) {
      return res.status(400).json({
        message:
          "Username, password, FirstName, LastName, Email, Bithdate, Role are required",
      });
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      birthDate,
      role,
      profileImage: image,
      address,
      isVerified: true,
    });
    await newUser.save();
    const users = await User.find();
    myCache.set("users", users);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAllUsersCache = async () => {
  try {
    const allUsers = await User.find();
    myCache.set("users", allUsers);
    console.log('Cache "allUsers" updated successfully.');
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

export const cacheUsers = async (req: RequestCustom, res: Response) => {
  try {
    const allUsers = await User.find();
    myCache.set("users", allUsers);
    return res.json({ message: "Cache sucessfully" });
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

export const getAllUsers = async (req: RequestCustom, res: Response) => {
  try {
    const page = req.query.page;
    if (!page) return res.json("Please input page");

    const pageSize = 5;
    const pageString: string = page as string;

    const totalUsers = await User.countDocuments();
    myCache.set("totalUsers", totalUsers);

    const totalPages = Math.ceil(totalUsers / pageSize);

    if (parseInt(pageString) > totalPages) {
      return res.json({ message: "Page cannot be greater than total page" });
    }

    const skip = (parseInt(pageString) - 1) * pageSize;

    let allUsers = myCache.get("users");

    if (allUsers == null) {
      console.log("Cache miss, querying the database...");
      allUsers = await User.find()
        .sort("_id")
        .skip(Math.max(0, skip))
        .limit(pageSize);
    } else {
      allUsers = allUsers
        .sort((a: any, b: any) => a._id - b._id)
        .slice(Math.max(0, skip), Math.max(0, skip) + pageSize);
      console.log("Data from cache...");
    }
    return res.json(allUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId, "-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update user by ID
export const updateUser = async (req: RequestCustom, res: Response) => {
  const userId = req.params.id;
  const data = req.body;
  const file = req.file;

  if (file) {
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = mimeTypes.extension(file.mimetype);

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return res
        .status(400)
        .json("Invalid file format. Only jpg, jpeg, and png are allowed.");
    }
  }

  try {
    // Validate birthDate
    const parsedBirthDate = parseFloat(data.birthDate);
    if (Number.isNaN(parsedBirthDate) || !Number.isFinite(parsedBirthDate)) {
      return res.status(400).json({
        message: "Birthdate must be a valid timestamp.",
      });
    }

    // Validate email
    if (!validator.isEmail(data.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    const currentTimeStamp: number = Date.now();
    const currentDate: Date = new Date(currentTimeStamp);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Process profileImage
    let profileImageBuffer;
    if (file) {
      const jimpImage: Jimp = await Jimp.read(file.buffer);
      profileImageBuffer = await jimpImage
        .resize(300, Jimp.AUTO)
        .quality(80)
        .getBufferAsync(Jimp.MIME_JPEG);
    } else {
      profileImageBuffer = user.profileImage.data;
    }

    // Update user data
    user.username = data.username;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.email = data.email;
    user.birthDate = data.birthDate;
    user.address = data.address;
    user.updatedAt = currentDate;

    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    if (profileImageBuffer) {
      user.profileImage = {
        data: profileImageBuffer,
      };
    }

    // Check user role and permissions
    if (req.user.user.role === "admin" || req.user.user._id === userId) {
      await user.save();
      const all = await User.find();
      myCache.set("users", all);
      return res.json({ message: "User updated successfully" });
    } else {
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this user" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete user by ID
export const deleteUser = async (req: RequestCustom, res: Response) => {
  const userId = req.params.id;

  try {
    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    if (req.user.user.role == "admin" || req.user.user._id == userId) {
      await user.deleteOne();
      await Blog.deleteMany({ user: user._id });
      const allUser = await User.find();
      myCache.set("users", allUser);
    } else {
      res.json({ message: "You cant edit with your access !!" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTest = async (req: RequestCustom, res: Response) => {
  try {
    if (myCache.has("users")) {
      return res.send({ data: myCache.get("users") });
    }
    const users = await User.find({}, "-password, -profileImage");
    myCache.set("users", users);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

cron.schedule("*/10 * * * *", async () => {
  console.log("Running task every 10 minutes...");
  await updateAllUsersCache();
});
