import User from "../models/User";
import verifiedCode from "../models/verifiedCode";
import { mymail, password } from "../app";
import { Request, Response } from "express";
import { jwtSecret } from "../utils/jwtUtil";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jimp from "jimp";
import mimeTypes from "mime-types";
import * as crypto from "crypto";
const nodemailer = require("nodemailer");
import validator from "validator";

export const loginService = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVerified == false) {
      return res
        .status(404)
        .json({ message: "Your account need to verify !!" });
    }

    // Compare the entered password with the hashed password from the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user: {
          username: user.username,
          role: user.role,
          _id: user._id,
        },
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createUserService = async (req: Request, res: Response) => {
  const { username, password, firstName, lastName, email, birthDate, address } =
    req.body;
  // Check if both username and password are provided
  if (
    !username ||
    !password ||
    !firstName ||
    !lastName ||
    !email ||
    !birthDate
  ) {
    return res.status(400).json({
      message:
        "Username, password, FirstName, LastName, Email, Bithdate are required",
    });
  }
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
  // Check file extension
  const allowedExtensions = ["jpg", "jpeg", "png"];
  const fileExtension = mimeTypes.extension(file.mimetype);

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return res
      .status(400)
      .json("Invalid file format. Only jpg, jpeg, and png are allowed.");
  }
  try {
    const compressedImageBuffer = await (await Jimp.read(file.buffer))
      .resize(300, Jimp.AUTO)
      .quality(80)
      .getBufferAsync(Jimp.MIME_JPEG);
    const image = {
      data: compressedImageBuffer,
    };
    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const verificationCode = crypto.randomBytes(10).toString("hex");

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password.trim(), 5);

    //Create a new user
    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      firstName,
      lastName,
      email,
      birthDate,
      role: "user",
      profileImage: image,
      address,
      isVerified: false,
    });
    await newUser.save();
    const unVerifiedUser = await User.findOne({ username: username });
    if (unVerifiedUser) {
      await sendWelcomeEmail(email, verificationCode);
    }
    const verification = new verifiedCode({
      userId: unVerifiedUser?._id,
      code: verificationCode,
    });
    await verification.save();
    res.status(201).json({
      message:
        "User created successfully. We have sent you a secret code, please verify it !!! ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Function to send a welcome email
const sendWelcomeEmail = async (userEmail: any, verificationCode: any) => {
  // Tạo URL xác nhận từ mã xác nhận
  // Nội dung email
  const emailContent = `
    <p>Thank you for registering with YourApp. Please confirm your verification code</p>
    <p> Your code is <strong>${verificationCode}</strong></a>
  `;

  // Thông tin email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mymail,
      pass: password,
    },
  });

  const mailOptions = {
    from: mymail,
    to: userEmail,
    subject: "Welcome to YourApp",
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      "Email sent successfully. User is pending for verification : )"
    );
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const verifyAccountService = async (req: Request, res: Response) => {
  try {
    if (!req.body.userId || !req.body.code) {
      return res
        .status(400)
        .json({ message: "Please fill userId and code !!!" });
    }
    if (req.body.userId.length != 24) {
      return res.status(405).json("Invalid userId");
    }
    var ObjectId = require("mongodb").ObjectId;
    const userId = new ObjectId(req.body.userId);

    const code = req.body.code;
    const record = await verifiedCode.findOne({ code: code });

    if (record) {
      const user = await User.findById(userId); // Use userId directly, not { userId }
      if (user) {
        user.isVerified = true;
        await user.save();
        return res.json("Account verified !");
      }
      return res.status(404).json("Invalid user");
    }

    return res
      .status(405)
      .json("Your code is expired, please create account again : )");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
