// userController.ts
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import Blog from "../models/Blog";
import mimeTypes from "mime-types";
import { RequestCustom } from "../../types/express";
import Jimp from "jimp";
import { myCache } from "../app";

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

  try {
    if (!file) {
      return res.json("Invalid file");
    }
    // Sử dụng sharp để thực hiện nén ảnh
    // Resize and compress the image using jimp
    const compressedImageBuffer = await (
      await Jimp.read(file.buffer)
    )
      .resize(300, Jimp.AUTO) // Resize width to 100px, maintain aspect ratio
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

// Get all users
export const getAllUsers = async (req: RequestCustom, res: Response) => {
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
  try {
    // Check if the user exists
    const user = await User.findById(userId);
    const currentTimeStamp: number = Date.now();
    const currentDate: Date = new Date(currentTimeStamp);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const compressedImageBuffer = await (
      await Jimp.read(data.profileImage)
    )
      .resize(300, Jimp.AUTO) // Resize width to 100px, maintain aspect ratio
      .quality(80) // Set the compression quality (adjust as needed)
      .getBufferAsync(Jimp.MIME_JPEG);

    // Update user data
    user.username = data.username;
    user.profileImage = data.profileImage;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.email = data.email;
    user.birthDate = data.birthDate;
    user.address = data.address;
    user.password = await bcrypt.hash(data.password, 10);
    user.updatedAt = currentDate;
    if (data.profileImage) {
      user.profileImage = {
        data: compressedImageBuffer,
      };
    }
    if (req.user.user.role == "admin" || req.user.user._id == userId) {
      await user.save();
    } else {
      res.json({ message: "You cant edit with your access !!" });
    }
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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