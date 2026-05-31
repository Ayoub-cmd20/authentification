import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { isBlockchainEnabled, verifyCertificateOnChain } from "../services/blockchain.service.js";
import { hashWithSecret } from "../services/hash.service.js";
import { buildVerificationPdf } from "../services/pdf.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notFound } from "../utils/errors.js";

export const publicRouter = Router();

publicRouter.get(
  "/verify/:verificationCode",
  asyncHandler(async (req, res) => {
    const record = await prisma.verificationRecord.findUnique({
      where: { verificationCode: req.params.verificationCode },
      include: {
        student: { include: { user: { select: { fullName: true, email: true } } } },
        submission: true
      }
    });
    if (!record) throw notFound("Verification record");

    const computedVerificationCodeHash = hashWithSecret(req.params.verificationCode);
    const databaseHashMatches = record.verificationCodeHash === computedVerificationCodeHash;
    let blockchain: Awaited<ReturnType<typeof verifyCertificateOnChain>> | null = null;
    let blockchainResult = "NOT_CONFIGURED";
    let certificateValidityStatus = record.isValid ? "VALID" : "REVOKED";

    if (isBlockchainEnabled() && record.verificationCodeHash) {
      blockchain = await verifyCertificateOnChain(computedVerificationCodeHash);
      const chainHasRecord = blockchain.registeredAt > 0;
      const hashesMatch =
        databaseHashMatches &&
        blockchain.verificationCodeHash.toLowerCase() === record.verificationCodeHash.toLowerCase() &&
        blockchain.documentHash.toLowerCase() === record.documentHash?.toLowerCase() &&
        blockchain.studentHash.toLowerCase() === record.studentHash?.toLowerCase() &&
        blockchain.degreeHash.toLowerCase() === record.degreeHash?.toLowerCase();

      if (!chainHasRecord || !databaseHashMatches) {
        blockchainResult = "INVALID";
        certificateValidityStatus = "INVALID";
      } else if (!hashesMatch) {
        blockchainResult = "BLOCKCHAIN_MISMATCH";
        certificateValidityStatus = "BLOCKCHAIN_MISMATCH";
      } else if (!blockchain.isValid || record.revokedAt || !record.isValid) {
        blockchainResult = "REVOKED";
        certificateValidityStatus = "REVOKED";
      } else {
        blockchainResult = "VALID";
        certificateValidityStatus = "VALID";
      }
    }

    res.json({
      verificationCode: record.verificationCode,
      isValid: record.isValid,
      revokedAt: record.revokedAt,
      verificationDate: record.generatedAt,
      qrCodeUrl: record.qrCodeUrl,
      blockchainResult,
      databaseHashMatches,
      blockchainTxHash: record.blockchainTxHash,
      blockchainNetwork: record.blockchainNetwork,
      contractAddress: record.contractAddress,
      onChain: blockchain,
      studentFullName: record.student.user.fullName,
      degree: record.student.degreeType,
      specialty: record.student.specialty,
      graduationYear: record.student.graduationYear,
      university: record.student.university,
      faculty: record.student.faculty,
      department: record.student.department,
      certificateNumber: record.student.certificateNumber,
      certificateValidityStatus
    });
  })
);

publicRouter.get(
  "/verify/:verificationCode/report",
  asyncHandler(async (req, res) => {
    const record = await prisma.verificationRecord.findUnique({
      where: { verificationCode: req.params.verificationCode },
      include: { student: { include: { user: true } }, submission: true }
    });
    if (!record) throw notFound("Verification record");
    const buffer = await buildVerificationPdf(record);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="public-verification-${record.verificationCode}.pdf"`);
    res.send(buffer);
  })
);
