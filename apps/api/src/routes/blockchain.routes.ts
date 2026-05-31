import { Router } from "express";
import { AuditAction, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { hashWithSecret } from "../services/hash.service.js";
import { isBlockchainEnabled, revokeCertificateOnChain, verifyCertificateOnChain } from "../services/blockchain.service.js";
import { audit } from "../services/audit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/errors.js";
import type { AuthRequest } from "../types.js";

export const blockchainRouter = Router();

blockchainRouter.get(
  "/verify/:verificationCode",
  asyncHandler(async (req, res) => {
    const record = await prisma.verificationRecord.findUnique({ where: { verificationCode: req.params.verificationCode } });
    if (!record) throw notFound("Verification record");
    if (!isBlockchainEnabled()) {
      return res.json({ enabled: false, status: "NOT_CONFIGURED", record });
    }
    const chain = await verifyCertificateOnChain(hashWithSecret(req.params.verificationCode));
    res.json({ enabled: true, status: chain.isValid ? "VALID" : "REVOKED", record, chain });
  })
);

blockchainRouter.post(
  "/revoke/:verificationCode",
  requireAuth,
  requireRole(UserRole.UNIVERSITY_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: AuthRequest, res) => {
    const record = await prisma.verificationRecord.findUnique({ where: { verificationCode: req.params.verificationCode } });
    if (!record?.verificationCodeHash) throw notFound("Verification record");
    if (!isBlockchainEnabled()) throw new AppError(503, "Blockchain integration is disabled");
    const txHash = await revokeCertificateOnChain(record.verificationCodeHash);
    const updated = await prisma.verificationRecord.update({
      where: { id: record.id },
      data: { isValid: false, revokedAt: new Date(), blockchainTxHash: txHash }
    });
    await audit({
      userId: req.user!.id,
      action: AuditAction.BLOCKCHAIN_CERTIFICATE_REVOKED,
      entityType: "VerificationRecord",
      entityId: record.id,
      details: { txHash }
    });
    res.json(updated);
  })
);
