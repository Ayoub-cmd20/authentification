import type { AuditAction } from "../constants/prismaEnums.js";
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
      details: JSON.stringify(input.details ?? {})
    }
  });
};
