import { Request, Response } from "express";

import {
  createUserService,
  loginService,
  verifyAccountService,
} from "../service/authService";

export const login = async (req: Request, res: Response) => {
  try {
    const rs = await loginService(req, res);
    return res.json(rs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const rs = await createUserService(req, res);
    return res.json(rs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const rs = await verifyAccountService(req, res);
    if (rs) {
      return res.json(rs);
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
