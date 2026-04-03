import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/appError";
import extractId from "../utils/extractId";

const ROLE_HIERARCHY = {
  VIEWER: 0,
  ANALYST: 1,
  ADMIN: 2,
} as const;

export function authenticate(minimumRole: keyof typeof ROLE_HIERARCHY = "VIEWER") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    try {
      const token = authHeader.split(" ")[1];
      const payload = await verifyAccessToken(token);

      if (ROLE_HIERARCHY[payload.role] < ROLE_HIERARCHY[minimumRole]) {
        throw new AppError("Forbidden: Admin access required", 403);
      }

      req.user = payload;
      req.user.sub = extractId("user", req.user.sub); // id is in string format converting to int
      next();
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("Invalid or expired access token", 401);
    }
  };
}
