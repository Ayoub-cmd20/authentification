import { Router } from "express";
import { SubmissionStatus, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const ministryRouter = Router();

ministryRouter.use(requireAuth, requireRole(UserRole.MINISTRY_ADMIN, UserRole.SUPER_ADMIN));

ministryRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [
      totalStudents,
      totalSubmissions,
      totalVerifiedCertificates,
      totalRejectedSubmissions,
      totalIncompleteFiles,
      totalInstitutions,
      totalInstitutionSearches,
      totalVerificationReportsGenerated,
      suspiciousSearchAttempts
    ] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.documentSubmission.count(),
      prisma.verificationRecord.count({ where: { isValid: true } }),
      prisma.documentSubmission.count({ where: { status: SubmissionStatus.REJECTED } }),
      prisma.documentSubmission.count({ where: { status: SubmissionStatus.INCOMPLETE } }),
      prisma.user.count({ where: { role: UserRole.INSTITUTION } }),
      prisma.institutionSearchLog.count(),
      prisma.verificationReport.count(),
      prisma.institutionSearchLog.count({ where: { resultFound: false } })
    ]);

    res.json({
      totalStudents,
      totalSubmissions,
      totalVerifiedCertificates,
      totalRejectedSubmissions,
      totalIncompleteFiles,
      totalInstitutions,
      totalInstitutionSearches,
      totalVerificationReportsGenerated,
      fraudSuspiciousSearchAttempts: suspiciousSearchAttempts
    });
  })
);

ministryRouter.get(
  "/stats/universities",
  asyncHandler(async (_req, res) => {
    const universities = await prisma.university.findMany({
      include: {
        _count: { select: { students: true } }
      },
      orderBy: { name: "asc" }
    });
    res.json(universities);
  })
);

ministryRouter.get(
  "/audit-logs",
  asyncHandler(async (_req, res) => {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { fullName: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 500
    });
    res.json(logs);
  })
);

ministryRouter.get(
  "/export",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.documentSubmission.findMany({
      include: { student: { include: { user: true } }, verificationRecords: true },
      orderBy: { createdAt: "desc" },
      take: 1000
    });
    const csv = [
      "student,university,status,verificationCode,createdAt",
      ...rows.map((row) =>
        [
          JSON.stringify(row.student.user.fullName),
          JSON.stringify(row.student.university ?? ""),
          row.status,
          row.verificationRecords[0]?.verificationCode ?? "",
          row.createdAt.toISOString()
        ].join(",")
      )
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"tawtheeq-ministry-export.csv\"");
    res.send(csv);
  })
);
