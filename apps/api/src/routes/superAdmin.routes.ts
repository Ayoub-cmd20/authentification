import { Router } from "express";
import { AuditAction, DocumentType, SubscriptionStatus, SubscriptionTier, UserRole } from "../constants/prismaEnums.js";
import { prisma } from "../config/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { audit } from "../services/audit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";

export const superAdminRouter = Router();

superAdminRouter.use(requireAuth, requireRole(UserRole.SUPER_ADMIN));

const parseSettingValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

superAdminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [students, submitted, approved, incomplete, rejected, institutions, verifications] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.documentSubmission.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.documentSubmission.count({ where: { status: { in: ["APPROVED", "COMPLETED"] } } }),
      prisma.documentSubmission.count({ where: { status: "INCOMPLETE" } }),
      prisma.documentSubmission.count({ where: { status: "REJECTED" } }),
      prisma.user.count({ where: { role: UserRole.INSTITUTION } }),
      prisma.verificationRecord.count()
    ]);
    res.json({ students, submitted, approved, incomplete, rejected, institutions, verifications });
  })
);

superAdminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  })
);

superAdminRouter.patch(
  "/users/:id/status",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: Boolean(req.body.isActive) },
      select: { id: true, fullName: true, email: true, role: true, isActive: true }
    });
    await audit({
      userId: (req as typeof req & { user?: { id: string } }).user?.id,
      action: AuditAction.ACCOUNT_STATUS_CHANGED,
      entityType: "User",
      entityId: user.id,
      details: { isActive: user.isActive }
    });
    res.json(user);
  })
);

superAdminRouter.patch(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    const role = req.body.role as UserRole;
    if (!Object.values(UserRole).includes(role)) throw new AppError(400, "Invalid role");
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, fullName: true, email: true, role: true, isActive: true }
    });
    await audit({
      userId: (req as typeof req & { user?: { id: string } }).user?.id,
      action: AuditAction.ROLE_CHANGED,
      entityType: "User",
      entityId: user.id,
      details: { role }
    });
    res.json(user);
  })
);

superAdminRouter.get(
  "/institutions",
  asyncHandler(async (_req, res) => {
    const institutions = await prisma.institutionProfile.findMany({
      include: { user: { select: { fullName: true, email: true, phone: true, isActive: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(institutions);
  })
);

superAdminRouter.patch(
  "/institutions/:id/subscription",
  asyncHandler(async (req, res) => {
    const status = req.body.subscriptionStatus as SubscriptionStatus | undefined;
    const tier = req.body.subscriptionTier as SubscriptionTier | undefined;
    const institution = await prisma.institutionProfile.update({
      where: { id: req.params.id },
      data: {
        subscriptionStatus: status && Object.values(SubscriptionStatus).includes(status) ? status : undefined,
        subscriptionTier: tier && Object.values(SubscriptionTier).includes(tier) ? tier : undefined,
        monthlySearchLimit: req.body.monthlySearchLimit ? Number(req.body.monthlySearchLimit) : undefined,
        subscriptionEndDate: req.body.subscriptionEndDate ? new Date(req.body.subscriptionEndDate) : undefined,
        isSubscriptionActive: req.body.isSubscriptionActive === undefined ? undefined : Boolean(req.body.isSubscriptionActive)
      }
    });
    res.json(institution);
  })
);

superAdminRouter.get(
  "/audit-logs",
  asyncHandler(async (_req, res) => {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { fullName: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 200
    });
    res.json(logs);
  })
);

superAdminRouter.get(
  "/document-requirements",
  asyncHandler(async (_req, res) => {
    const requirements = await prisma.documentRequirement.findMany({ orderBy: { sortOrder: "asc" } });
    res.json(requirements);
  })
);

superAdminRouter.patch(
  "/document-requirements/:id",
  asyncHandler(async (req, res) => {
    const requirement = await prisma.documentRequirement.update({
      where: { id: req.params.id },
      data: {
        label: req.body.label,
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        appliesWhen: req.body.appliesWhen,
        isRequired: Boolean(req.body.isRequired),
        isConditional: Boolean(req.body.isConditional),
        conditionKey: req.body.conditionKey,
        isActive: req.body.isActive === undefined ? undefined : Boolean(req.body.isActive)
      }
    });
    await audit({
      userId: (req as typeof req & { user?: { id: string } }).user?.id,
      action: AuditAction.DOCUMENT_REQUIREMENT_UPDATED,
      entityType: "DocumentRequirement",
      entityId: requirement.id,
      details: { documentType: requirement.documentType, isRequired: requirement.isRequired }
    });
    res.json(requirement);
  })
);

superAdminRouter.post(
  "/document-requirements",
  asyncHandler(async (req, res) => {
    const documentType = req.body.documentType as DocumentType;
    if (!Object.values(DocumentType).includes(documentType)) throw new AppError(400, "Invalid document type");
    const requirement = await prisma.documentRequirement.create({
      data: {
        documentType,
        name: req.body.name,
        code: req.body.code ?? documentType,
        label: req.body.label,
        description: req.body.description,
        appliesWhen: req.body.appliesWhen,
        isRequired: Boolean(req.body.isRequired),
        isConditional: Boolean(req.body.isConditional),
        conditionKey: req.body.conditionKey,
        sortOrder: Number(req.body.sortOrder ?? 99)
      }
    });
    res.status(201).json(requirement);
  })
);

superAdminRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const settings = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
    res.json(settings.map((setting) => ({ ...setting, value: parseSettingValue(setting.value) })));
  })
);

superAdminRouter.patch(
  "/settings/:key",
  asyncHandler(async (req, res) => {
    const setting = await prisma.systemSetting.upsert({
      where: { key: req.params.key },
      update: { value: JSON.stringify(req.body.value) },
      create: { key: req.params.key, value: JSON.stringify(req.body.value) }
    });
    res.json({ ...setting, value: parseSettingValue(setting.value) });
  })
);
