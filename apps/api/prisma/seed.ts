import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import bcrypt from "bcryptjs";
import { CompletenessStatus, DocumentType, PaymentStatus, SubmissionStatus, SubscriptionTier, UserRole } from "../src/constants/prismaEnums.js";
import { prisma } from "../src/config/prisma.js";
import { createVerificationRecord } from "../src/services/verification.service.js";

const password = async (envName: string) => bcrypt.hash(process.env[envName] ?? "Tawtheeq2026!Secure", 12);

const ensureSeedPdf = async (fileName: string, title: string) => {
  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "apps/api/uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  if (fs.existsSync(filePath)) return filePath.replaceAll("\\", "/");

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.pipe(stream);
    doc.fontSize(18).text(title);
    doc.fontSize(11).text("Seed document for local testing.");
    doc.end();
  });
  return filePath.replaceAll("\\", "/");
};

const main = async () => {
  const superAdmin = await prisma.user.upsert({
    where: { email: "super.admin@tawtheeq.example" },
    update: {},
    create: {
      fullName: "Platform Super Admin",
      email: "super.admin@tawtheeq.example",
      passwordHash: await password("SEED_SUPER_ADMIN_PASSWORD"),
      role: UserRole.SUPER_ADMIN,
      phone: "+213555000001"
    }
  });

  const universityAdmin = await prisma.user.upsert({
    where: { email: "university.admin@tawtheeq.example" },
    update: {},
    create: {
      fullName: "University Registrar Admin",
      email: "university.admin@tawtheeq.example",
      passwordHash: await password("SEED_UNIVERSITY_ADMIN_PASSWORD"),
      role: UserRole.UNIVERSITY_ADMIN,
      phone: "+213555000002"
    }
  });

  const ministryAdmin = await prisma.user.upsert({
    where: { email: "ministry.admin@tawtheeq.example" },
    update: {},
    create: {
      fullName: "Ministry Platform Analyst",
      email: "ministry.admin@tawtheeq.example",
      passwordHash: await password("SEED_MINISTRY_ADMIN_PASSWORD"),
      role: UserRole.MINISTRY_ADMIN,
      phone: "+213555000005"
    }
  });

  const university = await prisma.university.upsert({
    where: { code: "UA1" },
    update: {},
    create: {
      name: "University of Algiers 1",
      code: "UA1",
      city: "Algiers",
      address: "Benyoucef Benkhedda, Algiers"
    }
  });

  const studentEmail = "student@tawtheeq.example";
  let studentUser = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: { studentProfile: true }
  });

  if (!studentUser) {
    const existingStudentProfile = await prisma.studentProfile.findUnique({
      where: { nationalId: "NID-19990318-001" }
    });
    if (existingStudentProfile) {
      studentUser = await prisma.user.findUnique({
        where: { id: existingStudentProfile.userId },
        include: { studentProfile: true }
      });
    }
  }

  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        fullName: "Amina Benali",
        email: studentEmail,
        passwordHash: await password("SEED_STUDENT_PASSWORD"),
        role: UserRole.STUDENT,
        phone: "+213555000003",
        studentProfile: {
          create: {
            dateOfBirth: new Date("1999-03-18"),
            nationalId: "NID-19990318-001",
            nin: "NID-19990318-001",
            studentRegistrationNumber: "STU-2021-4455",
            universityId: university.id,
            university: "University of Algiers",
            faculty: "Faculty of Sciences",
            department: "Computer Science",
            specialty: "Software Engineering",
            graduationYear: 2021,
            degreeType: "Master",
            certificateNumber: "CERT-UA1-2021-0001"
          }
        }
      },
      include: { studentProfile: true }
    });
  }

  const start = new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  await prisma.user.upsert({
    where: { email: "institution@tawtheeq.example" },
    update: {},
    create: {
      fullName: "Institution Verification Officer",
      email: "institution@tawtheeq.example",
      passwordHash: await password("SEED_INSTITUTION_PASSWORD"),
      role: UserRole.INSTITUTION,
      phone: "+213555000004",
      institution: {
        create: {
          institutionName: "National Employment Agency",
          institutionType: "Public Institution",
          licenseNumber: "LIC-ANEM-001",
          taxId: "TAX-ANEM-001",
          contactPerson: "Institution Verification Officer",
          address: "Algiers",
          subscriptionTier: SubscriptionTier.PROFESSIONAL,
          monthlySearchLimit: 500,
          subscriptionStartDate: start,
          subscriptionEndDate: end
        }
      }
    }
  });

  const profile =
    studentUser.studentProfile ??
    (await prisma.studentProfile.findUniqueOrThrow({ where: { userId: studentUser.id } }));

  const [bacPath, transcriptsPath, certificatePath] = await Promise.all([
    ensureSeedPdf("seed-baccalaureate.pdf", "Seed Baccalaureate Transcript"),
    ensureSeedPdf("seed-transcripts.pdf", "Seed University Transcripts"),
    ensureSeedPdf("seed-certificate.pdf", "Seed Graduation Certificate")
  ]);

  const submission = await prisma.documentSubmission.upsert({
    where: { id: "seed-approved-submission" },
    update: {},
    create: {
      id: "seed-approved-submission",
      studentId: profile.id,
      status: SubmissionStatus.VERIFIED,
      completenessStatus: CompletenessStatus.COMPLETE,
      receiptNumber: "TWQ-RCPT-SEED-0001",
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedById: universityAdmin.id,
      documents: {
        create: [
          {
            documentType: DocumentType.BACCALAUREATE_TRANSCRIPT,
            fileName: "seed-baccalaureate.pdf",
            filePath: bacPath,
            mimeType: "application/pdf",
            size: 1024
          },
          {
            documentType: DocumentType.UNIVERSITY_TRANSCRIPTS,
            fileName: "seed-transcripts.pdf",
            filePath: transcriptsPath,
            mimeType: "application/pdf",
            size: 2048
          },
          {
            documentType: DocumentType.GRADUATION_CERTIFICATE,
            fileName: "seed-certificate.pdf",
            filePath: certificatePath,
            mimeType: "application/pdf",
            size: 1024
          }
        ]
      }
    }
  });

  const existing = await prisma.verificationRecord.findFirst({ where: { submissionId: submission.id } });
  if (!existing) {
    await createVerificationRecord(submission.id, universityAdmin.id);
    await prisma.documentSubmission.update({ where: { id: submission.id }, data: { status: SubmissionStatus.VERIFIED } });
  }

  const payment = await prisma.payment.upsert({
    where: { transactionReference: "TWQ-SEED-PAID-0001" },
    update: {},
    create: {
      userId: studentUser.id,
      submissionId: submission.id,
      amount: 1500,
      currency: "DZD",
      status: PaymentStatus.PAID,
      transactionReference: "TWQ-SEED-PAID-0001",
      paidAt: new Date()
    }
  });
  await prisma.documentSubmission.update({ where: { id: submission.id }, data: { paymentId: payment.id } });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: "Seed file approved",
      message: "Your sample academic authentication file is ready for verification."
    }
  });

  const requirementRows = [
    [DocumentType.BACCALAUREATE_TRANSCRIPT, "Baccalaureate transcript", true, "Always required"],
    [DocumentType.UNIVERSITY_TRANSCRIPTS, "Original academic transcripts", true, "Always required"],
    [DocumentType.GRADUATION_CERTIFICATE, "Final success/graduation certificate", true, "Always required"],
    [DocumentType.ACADEMIC_LEAVE, "Academic leave document", false, "Required if the student had academic leave"],
    [DocumentType.FAILED_YEAR_TRANSCRIPT, "Failed year transcript", false, "Required if the student repeated a year"],
    [DocumentType.DEBT_CLEARANCE, "Debt clearance document", false, "Required when administrative clearance is needed"],
    [DocumentType.INTERRUPTION_CERTIFICATE, "Interruption certificate", false, "Required after academic interruption"],
    [DocumentType.TRANSFER_FORM, "Transfer form", false, "Required for transferred students"],
    [DocumentType.PREVIOUS_UNIVERSITY_DOCUMENTS, "Previous university authenticated documents", false, "Required after university transfer"]
  ] as const;

  for (const [documentType, label, isRequired, appliesWhen] of requirementRows) {
    await prisma.documentRequirement.upsert({
      where: { documentType },
      update: { label, isRequired, appliesWhen },
      create: {
        documentType,
        label,
        name: label,
        code: documentType,
        isRequired,
        isConditional: !isRequired,
        appliesWhen,
        sortOrder: requirementRows.findIndex((row) => row[0] === documentType)
      }
    });
  }

  const platformBrand = { name: "Tawtheeq.dz", arabicName: "منصة توثيق" };

  await prisma.systemSetting.upsert({
    where: { key: "platform.brand" },
    update: { value: platformBrand },
    create: { key: "platform.brand", value: platformBrand }
  });

  console.log(`Seeded users. Super admin: ${superAdmin.email}. Ministry admin: ${ministryAdmin.email}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
