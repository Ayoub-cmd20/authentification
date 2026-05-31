import type { AuditAction } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const audit = async (input: {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) => {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: (input.details ?? {}) as Prisma.InputJsonValue
    }
  });
};
