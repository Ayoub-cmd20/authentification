import bcrypt from "bcryptjs";
import { Router } from "express";
import { AuditAction, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { institutionRegisterSchema, loginSchema, studentRegisterSchema } from "../utils/validators.js";
import { audit } from "../services/audit.service.js";
import { simpleRateLimit } from "../middleware/rateLimit.js";
import type { AuthRequest } from "../types.js";

export const authRouter = Router();

const publicUser = (user: { id: string; fullName: string; email: string; role: UserRole; phone: string | null; isActive: boolean }) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isActive: user.isActive
});

authRouter.post(
  "/register/student",
  asyncHandler(async (req, res) => {
    const body = studentRegisterSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email.toLowerCase(),
        passwordHash,
        role: UserRole.STUDENT,
        phone: body.phone,
        studentProfile: {
          create: {
            nationalId: body.nationalId,
            nin: body.nationalId,
            studentRegistrationNumber: body.studentRegistrationNumber
          }
        }
      }
    });
    await audit({ userId: user.id, action: AuditAction.STUDENT_REGISTRATION, entityType: "User", entityId: user.id });
    res.status(201).json({ user: publicUser(user), token: signToken({ id: user.id, role: user.role }) });
  })
);

authRouter.post(
  "/register/institution",
  asyncHandler(async (req, res) => {
    const body = institutionRegisterSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    const user = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email.toLowerCase(),
        passwordHash,
        role: UserRole.INSTITUTION,
        phone: body.phone,
        institution: {
          create: {
            institutionName: body.institutionName,
            institutionType: body.institutionType,
            licenseNumber: body.licenseNumber,
            taxId: body.taxId,
            address: body.address,
            contactPerson: body.contactPerson ?? body.fullName,
            subscriptionStartDate: start,
            subscriptionEndDate: end
          }
        }
      }
    });
    await audit({ userId: user.id, action: AuditAction.INSTITUTION_REGISTRATION, entityType: "User", entityId: user.id });
    res.status(201).json({ user: publicUser(user), token: signToken({ id: user.id, role: user.role }) });
  })
);

authRouter.post(
  "/login",
  simpleRateLimit("login", 8, 15 * 60 * 1000),
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      await audit({ userId: user?.id, action: AuditAction.FAILED_LOGIN, entityType: "User", entityId: user?.id });
      throw new AppError(401, "Invalid email or password");
    }
    if (!user.isActive) throw new AppError(403, "Account is inactive");

    await audit({ userId: user.id, action: AuditAction.LOGIN, entityType: "User", entityId: user.id });
    res.json({ user: publicUser(user), token: signToken({ id: user.id, role: user.role }) });
  })
);

authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await audit({ userId: req.user!.id, action: AuditAction.LOGOUT, entityType: "User", entityId: req.user!.id });
    res.status(204).send();
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  })
);
