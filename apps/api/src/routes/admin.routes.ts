import path from "node:path";
import { Router } from "express";
import { AuditAction, SubmissionStatus, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { audit } from "../services/audit.service.js";
import { notify } from "../services/notification.service.js";
import { buildVerificationPdf } from "../services/pdf.service.js";
import { createVerificationRecord } from "../services/verification.service.js";
import { revokeCertificateOnChain } from "../services/blockchain.service.js";
import { decryptLocalFile } from "../services/storage.service.js";
import { evaluateSubmissionCompleteness } from "../services/validation.service.js";
import { isSubmissionPaid } from "../services/payment.service.js";
import { progressIntegrationService } from "../services/progressIntegration.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/errors.js";
import type { AuthRequest } from "../types.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(UserRole.UNIVERSITY_ADMIN, UserRole.SUPER_ADMIN));

const submissionInclude = {
  student: { include: { user: { select: { id: true, fullName: true, email: true, phone: true, isActive: true } } } },
  documents: true,
  reviewedBy: { select: { id: true, fullName: true, email: true } },
  verificationRecords: true
};

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [students, submitted, approved, incomplete, rejected, institutions, verifications] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.documentSubmission.count({ where: { status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW] } } }),
      prisma.documentSubmission.count({ where: { status: { in: [SubmissionStatus.APPROVED, SubmissionStatus.VERIFIED, SubmissionStatus.COMPLETED, SubmissionStatus.ARCHIVED] } } }),
      prisma.documentSubmission.count({ where: { status: SubmissionStatus.INCOMPLETE } }),
      prisma.documentSubmission.count({ where: { status: SubmissionStatus.REJECTED } }),
      prisma.user.count({ where: { role: UserRole.INSTITUTION } }),
      prisma.verificationRecord.count()
    ]);
    res.json({ students, submitted, approved, incomplete, rejected, institutions, verifications });
  })
);

adminRouter.get(
  "/submissions",
  asyncHandler(async (req, res) => {
    const status = req.query.status as SubmissionStatus | undefined;
    const submissions = await prisma.documentSubmission.findMany({
      where: status ? { status } : {},
      include: submissionInclude,
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }]
    });
    res.json(submissions);
  })
);

adminRouter.get(
  "/submissions/:id",
  asyncHandler(async (req, res) => {
    const submission = await prisma.documentSubmission.findUnique({ where: { id: req.params.id }, include: submissionInclude });
    if (!submission) throw notFound("Submission");
    res.json(submission);
  })
);

adminRouter.patch(
  "/submissions/:id/status",
  asyncHandler(async (req: AuthRequest, res) => {
    const status = req.body.status as SubmissionStatus;
    if (!Object.values(SubmissionStatus).includes(status)) throw new AppError(400, "Invalid status");
    const submission = await prisma.documentSubmission.update({
      where: { id: req.params.id },
      data: { status, adminNotes: req.body.adminNotes, reviewedAt: new Date(), reviewedById: req.user!.id },
      include: submissionInclude
    });
    res.json(submission);
  })
);

adminRouter.post(
  "/submissions/:id/approve",
  asyncHandler(async (req: AuthRequest, res) => {
    const submission = await prisma.documentSubmission.findUnique({ where: { id: req.params.id }, include: submissionInclude });
    if (!submission) throw notFound("Submission");
    const validation = await evaluateSubmissionCompleteness(submission.id, submission.documents);
    if (validation.missingTypes.length) throw new AppError(400, `Missing required documents: ${validation.missingTypes.join(", ")}`);
    const paid = await isSubmissionPaid(submission.id);
    if (!paid && !req.body.adminOverridePayment) throw new AppError(402, "Payment is not paid. Use adminOverridePayment to override.");
    const progress = await progressIntegrationService.validateAcademicPath({
      nin: submission.student.nin ?? submission.student.nationalId,
      studentRegistrationNumber: submission.student.studentRegistrationNumber,
      certificateNumber: submission.student.certificateNumber
    });
    if (!progress.valid && !req.body.adminOverrideProgress) throw new AppError(422, "Mock Progress academic path validation failed");
    const existingRecord = await prisma.verificationRecord.findFirst({ where: { submissionId: submission.id } });
    const verification = existingRecord ?? (await createVerificationRecord(submission.id, req.user!.id));
    const completed = await prisma.documentSubmission.update({
      where: { id: submission.id },
      data: {
        status: SubmissionStatus.VERIFIED,
        adminNotes: req.body.adminNotes,
        reviewedAt: new Date(),
        reviewedById: req.user!.id
      },
      include: submissionInclude
    });
    await notify(submission.student.user.id, "File approved", "Your academic path authentication file has been approved.");
    await audit({ userId: req.user!.id, action: AuditAction.FILE_APPROVAL, entityType: "DocumentSubmission", entityId: submission.id });
    if (verification.blockchainTxHash) {
      await audit({
        userId: req.user!.id,
        action: AuditAction.BLOCKCHAIN_CERTIFICATE_REGISTERED,
        entityType: "VerificationRecord",
        entityId: verification.id,
        details: { txHash: verification.blockchainTxHash, network: verification.blockchainNetwork }
      });
    }
    res.json(completed);
  })
);

adminRouter.post(
  "/submissions/:id/reject",
  asyncHandler(async (req: AuthRequest, res) => {
    const submission = await prisma.documentSubmission.update({
      where: { id: req.params.id },
      data: {
        status: SubmissionStatus.REJECTED,
        adminNotes: req.body.adminNotes,
        reviewedAt: new Date(),
        reviewedById: req.user!.id
      },
      include: submissionInclude
    });
    await notify(submission.student.user.id, "File rejected", req.body.adminNotes ?? "Your file has been rejected.");
    await audit({ userId: req.user!.id, action: AuditAction.FILE_REJECTION, entityType: "DocumentSubmission", entityId: submission.id });
    res.json(submission);
  })
);

adminRouter.post(
  "/submissions/:id/archive",
  asyncHandler(async (req: AuthRequest, res) => {
    const submission = await prisma.documentSubmission.update({
      where: { id: req.params.id },
      data: {
        status: SubmissionStatus.ARCHIVED,
        archivedAt: new Date(),
        reviewedById: req.user!.id,
        adminNotes: req.body.adminNotes
      },
      include: submissionInclude
    });
    await audit({ userId: req.user!.id, action: AuditAction.FILE_ARCHIVED, entityType: "DocumentSubmission", entityId: submission.id });
    res.json(submission);
  })
);

adminRouter.post(
  "/submissions/:id/mark-incomplete",
  asyncHandler(async (req: AuthRequest, res) => {
    const submission = await prisma.documentSubmission.update({
      where: { id: req.params.id },
      data: {
        status: SubmissionStatus.INCOMPLETE,
        adminNotes: req.body.adminNotes ?? "Documents are missing or require correction.",
        reviewedAt: new Date(),
        reviewedById: req.user!.id
      },
      include: submissionInclude
    });
    await notify(submission.student.user.id, "File incomplete", submission.adminNotes ?? "Please complete the missing documents.");
    await audit({ userId: req.user!.id, action: AuditAction.FILE_INCOMPLETE, entityType: "DocumentSubmission", entityId: submission.id });
    res.json(submission);
  })
);

adminRouter.post(
  "/submissions/:id/generate-verification",
  asyncHandler(async (req: AuthRequest, res) => {
    const submission = await prisma.documentSubmission.findUnique({ where: { id: req.params.id } });
    if (!submission) throw notFound("Submission");
    if (
      ![SubmissionStatus.APPROVED, SubmissionStatus.COMPLETED, SubmissionStatus.VERIFIED].some(
        (status) => status === submission.status
      )
    ) {
      throw new AppError(400, "Only approved submissions can receive a verification code");
    }
    const existingRecord = await prisma.verificationRecord.findFirst({ where: { submissionId: submission.id } });
    const record = existingRecord ?? (await createVerificationRecord(submission.id, req.user!.id));
    await prisma.documentSubmission.update({ where: { id: submission.id }, data: { status: SubmissionStatus.VERIFIED } });
    await audit({ userId: req.user!.id, action: AuditAction.VERIFICATION_GENERATED, entityType: "VerificationRecord", entityId: record.id });
    if (record.blockchainTxHash) {
      await audit({
        userId: req.user!.id,
        action: AuditAction.BLOCKCHAIN_CERTIFICATE_REGISTERED,
        entityType: "VerificationRecord",
        entityId: record.id,
        details: { txHash: record.blockchainTxHash, network: record.blockchainNetwork }
      });
    }
    res.status(201).json(record);
  })
);

adminRouter.post(
  "/verification/:id/revoke",
  asyncHandler(async (req: AuthRequest, res) => {
    const record = await prisma.verificationRecord.findUnique({ where: { id: req.params.id } });
    if (!record) throw notFound("Verification record");
    if (!record.verificationCodeHash) throw new AppError(400, "Verification record does not have a blockchain hash");

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
      details: { txHash, network: record.blockchainNetwork }
    });
    res.json(updated);
  })
);

adminRouter.get(
  "/submissions/:submissionId/documents/:documentId/download",
  asyncHandler(async (req, res) => {
    const document = await prisma.studentDocument.findFirst({
      where: { id: req.params.documentId, submissionId: req.params.submissionId }
    });
    if (!document) throw notFound("Document");
    if (document.filePath.endsWith(".enc")) {
      const buffer = await decryptLocalFile(document.filePath);
      res.setHeader("Content-Type", document.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${document.fileName}"`);
      return res.send(buffer);
    }
    res.download(path.resolve(document.filePath), document.fileName);
  })
);

adminRouter.get(
  "/verification/:id/pdf",
  asyncHandler(async (req, res) => {
    const verification = await prisma.verificationRecord.findUnique({
      where: { id: req.params.id },
      include: { student: { include: { user: true } }, submission: true }
    });
    if (!verification) throw notFound("Verification record");
    const buffer = await buildVerificationPdf(verification);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="verification-${verification.verificationCode}.pdf"`);
    res.send(buffer);
  })
);
