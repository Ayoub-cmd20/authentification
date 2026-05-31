import path from "node:path";
import QRCode from "qrcode";
import { Router } from "express";
import { AuditAction, CompletenessStatus, DocumentType, DocumentValidationStatus, SubmissionStatus, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pdfUpload } from "../middleware/upload.js";
import { audit } from "../services/audit.service.js";
import { notify } from "../services/notification.service.js";
import { buildReceiptPdf } from "../services/pdf.service.js";
import { decryptLocalFile, encryptLocalFile, sha256File } from "../services/storage.service.js";
import { evaluateSubmissionCompleteness } from "../services/validation.service.js";
import { isSubmissionPaid } from "../services/payment.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/errors.js";
import { studentProfileSchema } from "../utils/validators.js";
import type { AuthRequest } from "../types.js";

export const studentRouter = Router();

studentRouter.use(requireAuth, requireRole(UserRole.STUDENT));

const getStudentProfile = async (userId: string) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { user: { select: { fullName: true, email: true, phone: true } } }
  });
  if (!profile) throw notFound("Student profile");
  return profile;
};

const ensureReceipt = async (submissionId: string) => {
  const submission = await prisma.documentSubmission.findUniqueOrThrow({ where: { id: submissionId } });
  if (submission.receiptNumber && submission.receiptQrCode) return submission;
  const receiptNumber = submission.receiptNumber ?? `TWQ-RCPT-${Date.now()}-${submission.id.slice(0, 6).toUpperCase()}`;
  const receiptQrCode = await QRCode.toDataURL(`${env.WEB_APP_URL}/student/submission?receipt=${receiptNumber}`);
  return prisma.documentSubmission.update({ where: { id: submissionId }, data: { receiptNumber, receiptQrCode } });
};

studentRouter.get(
  "/profile",
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(await getStudentProfile(req.user!.id));
  })
);

studentRouter.put(
  "/profile",
  asyncHandler(async (req: AuthRequest, res) => {
    const body = studentProfileSchema.parse(req.body);
    const profile = await getStudentProfile(req.user!.id);
    const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined;

    const [updated] = await prisma.$transaction([
      prisma.studentProfile.update({
        where: { id: profile.id },
        data: {
          dateOfBirth,
          nationalId: body.nationalId ?? undefined,
          studentRegistrationNumber: body.studentRegistrationNumber ?? undefined,
          university: body.university ?? undefined,
          faculty: body.faculty ?? undefined,
          department: body.department ?? undefined,
          specialty: body.specialty ?? undefined,
          graduationYear: body.graduationYear ?? undefined,
          degreeType: body.degreeType ?? undefined
        },
        include: { user: { select: { fullName: true, email: true, phone: true } } }
      }),
      prisma.user.update({
        where: { id: req.user!.id },
        data: { fullName: body.fullName ?? undefined, phone: body.phone ?? undefined }
      })
    ]);
    await audit({ userId: req.user!.id, action: AuditAction.PROFILE_UPDATED, entityType: "StudentProfile", entityId: profile.id });
    res.json(updated);
  })
);

studentRouter.post(
  "/submissions",
  asyncHandler(async (req: AuthRequest, res) => {
    const profile = await getStudentProfile(req.user!.id);
    const existingDraft = await prisma.documentSubmission.findFirst({
      where: { studentId: profile.id, status: SubmissionStatus.DRAFT }
    });
    if (existingDraft) return res.status(200).json(existingDraft);

    const submission = await prisma.documentSubmission.create({
      data: { studentId: profile.id, status: SubmissionStatus.DRAFT }
    });
    await ensureReceipt(submission.id);
    res.status(201).json(submission);
  })
);

studentRouter.get(
  "/submissions",
  asyncHandler(async (req: AuthRequest, res) => {
    const profile = await getStudentProfile(req.user!.id);
    const submissions = await prisma.documentSubmission.findMany({
      where: { studentId: profile.id },
      include: { documents: true, missingDocuments: { include: { documentRequirement: true } }, payment: true, verificationRecords: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(submissions);
  })
);

studentRouter.get(
  "/submissions/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const profile = await getStudentProfile(req.user!.id);
    const submission = await prisma.documentSubmission.findFirst({
      where: { id: req.params.id, studentId: profile.id },
      include: { documents: true, missingDocuments: { include: { documentRequirement: true } }, payment: true, verificationRecords: true }
    });
    if (!submission) throw notFound("Submission");
    res.json(submission);
  })
);

studentRouter.post(
  "/submissions/:id/documents",
  pdfUpload.single("file"),
  asyncHandler(async (req: AuthRequest, res) => {
    const profile = await getStudentProfile(req.user!.id);
    const submission = await prisma.documentSubmission.findFirst({ where: { id: req.params.id, studentId: profile.id } });
    if (!submission) throw notFound("Submission");
    if (!req.file) throw new AppError(400, "PDF file is required");
    const documentType = req.body.documentType as DocumentType;
    if (!Object.values(DocumentType).includes(documentType)) throw new AppError(400, "Invalid document type");

    const sha256Hash = await sha256File(req.file.path);
    const storagePath = await encryptLocalFile(req.file.path);

    const existing = await prisma.studentDocument.findFirst({
      where: { submissionId: submission.id, documentType }
    });
    if (existing) throw new AppError(409, "This document type was already uploaded for this submission");

    const document = await prisma.studentDocument.create({
      data: {
        submissionId: submission.id,
        documentType,
        fileName: req.file.originalname,
        filePath: storagePath,
        storagePath,
        mimeType: req.file.mimetype,
        size: req.file.size,
        sha256Hash,
        validationStatus: DocumentValidationStatus.VALID
      }
    });
    const documents = await prisma.studentDocument.findMany({ where: { submissionId: submission.id } });
    const validation = await evaluateSubmissionCompleteness(submission.id, documents);
    await prisma.documentSubmission.update({
      where: { id: submission.id },
      data: { completenessStatus: validation.completenessStatus }
    });
    await audit({ userId: req.user!.id, action: AuditAction.DOCUMENT_UPLOADED, entityType: "StudentDocument", entityId: document.id });
    res.status(201).json({ document, validation });
  })
);

studentRouter.post(
  "/submissions/:id/submit",
  asyncHandler(async (req: AuthRequest, res) => {
    const profile = await getStudentProfile(req.user!.id);
    const submission = await prisma.documentSubmission.findFirst({
      where: { id: req.params.id, studentId: profile.id },
      include: { documents: true }
    });
    if (!submission) throw notFound("Submission");
    const validation = await evaluateSubmissionCompleteness(submission.id, submission.documents);
    await ensureReceipt(submission.id);
    if (validation.completenessStatus === CompletenessStatus.INCOMPLETE) {
      const incomplete = await prisma.documentSubmission.update({
        where: { id: submission.id },
        data: { status: SubmissionStatus.INCOMPLETE, completenessStatus: CompletenessStatus.INCOMPLETE },
        include: { documents: true, missingDocuments: { include: { documentRequirement: true } }, verificationRecords: true }
      });
      return res.status(200).json({ submission: incomplete, validation });
    }
    const paid = await isSubmissionPaid(submission.id);
    if (!paid) throw new AppError(402, "Payment is required before final submission");

    const updated = await prisma.documentSubmission.update({
      where: { id: submission.id },
      data: { status: SubmissionStatus.SUBMITTED, completenessStatus: CompletenessStatus.COMPLETE, submittedAt: new Date() },
      include: { documents: true, missingDocuments: { include: { documentRequirement: true } }, verificationRecords: true }
    });
    await notify(req.user!.id, "File submitted", "Your academic authentication file has been submitted for review.");
    await audit({ userId: req.user!.id, action: AuditAction.FILE_SUBMISSION, entityType: "DocumentSubmission", entityId: submission.id });
    res.json(updated);
  })
);

studentRouter.get(
  "/submissions/:id/receipt",
  asyncHandler(async (req: AuthRequest, res) => {
    const profile = await getStudentProfile(req.user!.id);
    const submission = await prisma.documentSubmission.findFirst({
      where: { id: req.params.id, studentId: profile.id },
      include: { documents: true, student: { include: { user: true } }, verificationRecords: true }
    });
    if (!submission) throw notFound("Submission");
    await ensureReceipt(submission.id);
    const refreshed = await prisma.documentSubmission.findUniqueOrThrow({
      where: { id: submission.id },
      include: {
        documents: true,
        missingDocuments: { include: { documentRequirement: true } },
        student: { include: { user: true } },
        verificationRecords: true
      }
    });
    const buffer = await buildReceiptPdf(refreshed);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="receipt-${submission.id}.pdf"`);
    res.send(buffer);
  })
);

studentRouter.get(
  "/submissions/:submissionId/documents/:documentId/download",
  asyncHandler(async (req: AuthRequest, res) => {
    const profile = await getStudentProfile(req.user!.id);
    const document = await prisma.studentDocument.findFirst({
      where: { id: req.params.documentId, submission: { id: req.params.submissionId, studentId: profile.id } }
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

studentRouter.get(
  "/payments",
  asyncHandler(async (req: AuthRequest, res) => {
    const payments = await prisma.payment.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } });
    res.json(payments);
  })
);

studentRouter.get(
  "/notifications",
  asyncHandler(async (req: AuthRequest, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(notifications);
  })
);
