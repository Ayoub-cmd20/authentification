import type { UserRole } from "./constants/prismaEnums.js";
import type { Request } from "express";

export type AuthUser = {
  id: string;
  role: UserRole;
  email: string;
  fullName: string;
  isActive: boolean;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};
