// middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtSecret } from "../utils/jwtUtil";
import { RequestCustom } from "../../types/express";

export const authenticate = (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
