// middleware/authorize.ts
import { Response, NextFunction } from "express";
import { RequestCustom } from "../../types/express";

export const authorize = (allowedRoles: string[]) => {
  return (req: RequestCustom, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Invalid role" });
    }

    if (!allowedRoles.includes(user.user.role)) {
      return res.status(403).json({ error: "Invalid role" });
    }

    next();
  };
};
