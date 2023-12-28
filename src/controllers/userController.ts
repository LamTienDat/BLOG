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
import {
  adminCreateUserService,
  cacheUsersService,
  deleteUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
} from "../service/userService";

export const adminCreateUser = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await adminCreateUserService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
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
    const rs = await cacheUsersService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

export const getAllUsers = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await getAllUsersService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const rs = await getUserByIdService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update user by ID
export const updateUser = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await updateUserService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete user by ID
export const deleteUser = async (req: RequestCustom, res: Response) => {
  try {
    const rs = await deleteUserService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
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
