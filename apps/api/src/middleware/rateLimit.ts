import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

const buckets = new Map<string, { count: number; resetAt: number }>();

export const simpleRateLimit =
  (name: string, maxRequests: number, windowMs: number) => (req: Request, _res: Response, next: NextFunction) => {
    const key = `${name}:${req.ip}:${req.headers.authorization ?? ""}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > maxRequests) {
      return next(new AppError(429, "Too many requests. Please try again later."));
    }
    next();
  };
