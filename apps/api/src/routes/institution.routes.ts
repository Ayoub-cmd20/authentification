import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import { AuditAction, SubmissionStatus, SubscriptionStatus, SubscriptionTier, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { simpleRateLimit } from "../middleware/rateLimit.js";
import { audit } from "../services/audit.service.js";
import { buildVerificationPdf } from "../services/pdf.service.js";
import { digitalSignatureService } from "../services/digitalSignature.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/errors.js";
import type { AuthRequest } from "../types.js";

export const institutionRouter = Router();

institutionRouter.use(requireAuth, requireRole(UserRole.INSTITUTION));

const getInstitution = async (userId: string) => {
  const institution = await prisma.institutionProfile.findUnique({ where: { userId } });
  if (!institution) throw notFound("Institution profile");
  if (
    !institution.isSubscriptionActive ||
    institution.subscriptionStatus !== SubscriptionStatus.ACTIVE ||
    institution.subscriptionEndDate < new Date()
  ) {
    throw new AppError(403, "Institution subscription is inactive or expired");
  }
  return institution;
};

const mask = (value?: string | null) => {
  if (!value) return null;
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}${"*".repeat(Math.max(4, value.length - 4))}${value.slice(-2)}`;
};

institutionRouter.get(
  "/subscription",
  asyncHandler(async (req: AuthRequest, res) => {
    const institution = await prisma.institutionProfile.findUnique({ where: { userId: req.user!.id } });
    if (!institution) throw notFound("Institution profile");
    res.json(institution);
  })
);

institutionRouter.get(
  "/search",
  simpleRateLimit("institution-search", 60, 60 * 60 * 1000),
  asyncHandler(async (req: AuthRequest, res) => {
    const institution = await getInstitution(req.user!.id);
    const query = String(req.query.q ?? "").trim();
    const queryType = String(req.query.type ?? "GENERAL");
    if (query.length < 2) throw new AppError(400, "Search query must contain at least 2 characters");
    if (
      institution.subscriptionTier !== SubscriptionTier.ENTERPRISE &&
      institution.searchesUsedThisMonth >= institution.monthlySearchLimit
    ) {
      throw new AppError(429, "Monthly search limit reached for this subscription");
    }

    const records = await prisma.verificationRecord.findMany({
      where: {
        isValid: true,
        submission: { status: { in: [SubmissionStatus.VERIFIED, SubmissionStatus.COMPLETED, SubmissionStatus.ARCHIVED] } },
        student: {
          OR: [
            { studentRegistrationNumber: { contains: query, mode: "insensitive" } },
            { nationalId: { contains: query, mode: "insensitive" } },
            { nin: { contains: query, mode: "insensitive" } },
            { certificateNumber: { contains: query, mode: "insensitive" } },
            { user: { fullName: { contains: query, mode: "insensitive" } } }
          ]
        }
      },
      include: { student: { include: { user: true } }, submission: true },
      orderBy: { generatedAt: "desc" },
      take: 10
    });

    const certificateMatches = await prisma.verificationRecord.findMany({
      where: { verificationCode: { contains: query, mode: "insensitive" }, isValid: true },
      include: { student: { include: { user: true } }, submission: true },
      take: 10
    });
    const merged = [...records, ...certificateMatches].filter(
      (record, index, all) => all.findIndex((item) => item.id === record.id) === index
    );

    await prisma.institutionProfile.update({
      where: { id: institution.id },
      data: { searchesUsedThisMonth: { increment: 1 } }
    });
    await prisma.institutionSearchLog.create({
      data: {
        institutionId: institution.id,
        searchQuery: query,
        queryType,
        queryValueMasked: mask(query),
        resultFound: merged.length > 0,
        verificationRecordId: merged[0]?.id,
        ipAddress: req.ip
      }
    });
    await audit({
      userId: req.user!.id,
      action: AuditAction.INSTITUTION_SEARCH,
      entityType: "VerificationRecord",
      details: { query, resultCount: merged.length }
    });
    res.json(
      merged.map((record) => ({
        ...record,
        student: {
          ...record.student,
          nationalId: mask(record.student.nationalId),
          nin: mask(record.student.nin),
          user: {
            ...record.student.user,
            email: institution.subscriptionTier === SubscriptionTier.BASIC ? mask(record.student.user.email) : record.student.user.email
          }
        }
      }))
    );
  })
);

institutionRouter.get(
  "/verification-history",
  asyncHandler(async (req: AuthRequest, res) => {
    const institution = await getInstitution(req.user!.id);
    const history = await prisma.institutionSearchLog.findMany({
      where: { institutionId: institution.id },
      orderBy: { searchedAt: "desc" },
      take: 100
    });
    res.json(history);
  })
);

institutionRouter.post(
  "/reports/:verificationRecordId",
  asyncHandler(async (_req, res) => {
    const institution = await getInstitution((_req as AuthRequest).user!.id);
    const verification = await prisma.verificationRecord.findUnique({
      where: { id: _req.params.verificationRecordId },
      include: { student: { include: { user: true } }, submission: true }
    });
    if (!verification) throw notFound("Verification record");
    const buffer = await buildVerificationPdf(verification);
    const sealed = digitalSignatureService.embedDigitalSeal(buffer);
    const pdfHash = digitalSignatureService.generatePdfHash(sealed);
    await digitalSignatureService.requestDigitalSignature(pdfHash);
    const reportsDir = path.resolve(env.UPLOAD_DIR, "reports");
    await fs.mkdir(reportsDir, { recursive: true });
    const reportNumber = `TWQ-RPT-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const pdfPath = path.join(reportsDir, `${reportNumber}.pdf`);
    await fs.writeFile(pdfPath, sealed);
    const report = await prisma.verificationReport.create({
      data: {
        institutionId: institution.id,
        verificationRecordId: verification.id,
        reportNumber,
        pdfPath: pdfPath.replaceAll("\\", "/"),
        pdfHash,
        generatedById: (_req as AuthRequest).user!.id
      }
    });
    await audit({
      userId: (_req as AuthRequest).user!.id,
      action: AuditAction.PDF_REPORT_GENERATED,
      entityType: "VerificationReport",
      entityId: report.id
    });
    res.status(201).json(report);
  })
);

institutionRouter.get(
  "/reports/:id/download",
  asyncHandler(async (req: AuthRequest, res) => {
    const institution = await getInstitution(req.user!.id);
    const report = await prisma.verificationReport.findFirst({ where: { id: req.params.id, institutionId: institution.id } });
    if (!report?.pdfPath) throw notFound("Verification report");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${report.reportNumber}.pdf"`);
    res.send(await fs.readFile(path.resolve(report.pdfPath)));
  })
);

institutionRouter.get(
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
