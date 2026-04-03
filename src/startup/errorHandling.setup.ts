import { type Express, type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";

export function initErrorHandler(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    if (err instanceof Error) {
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(500).json({ error: "Internal server error" });
  });
}
