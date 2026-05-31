import PDFDocument from "pdfkit";
import type { DocumentRequirement, DocumentSubmission, MissingDocument, StudentDocument, StudentProfile, User, VerificationRecord } from "@prisma/client";

type SubmissionBundle = DocumentSubmission & {
  student: StudentProfile & { user: User };
  documents: StudentDocument[];
  missingDocuments?: (MissingDocument & { documentRequirement: DocumentRequirement })[];
  verificationRecords?: VerificationRecord[];
};

const collectPdf = (doc: PDFKit.PDFDocument) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

export const buildReceiptPdf = async (submission: SubmissionBundle) => {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const done = collectPdf(doc);
  const student = submission.student;

  doc.fontSize(18).text("Tawtheeq.dz - Academic Authentication Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Receipt number: ${submission.receiptNumber ?? submission.id}`);
  doc.text(`Generated at: ${new Date().toISOString()}`);
  doc.text(`Submission status: ${submission.status}`);
  doc.text(`Receipt status: ${submission.completenessStatus}`);
  doc.text("Digital seal: Tawtheeq.dz MVP placeholder");
  doc.moveDown();

  doc.fontSize(14).text("Student Information");
  doc.fontSize(10);
  [
    ["Full name", student.user.fullName],
    ["Email", student.user.email],
    ["Phone", student.user.phone ?? "N/A"],
    ["Date of birth", student.dateOfBirth?.toISOString().slice(0, 10) ?? "N/A"],
    ["National ID", student.nationalId ?? "N/A"],
    ["Student registration number", student.studentRegistrationNumber ?? "N/A"],
    ["University", student.university ?? "N/A"],
    ["Faculty", student.faculty ?? "N/A"],
    ["Department", student.department ?? "N/A"],
    ["Specialty", student.specialty ?? "N/A"],
    ["Graduation year", student.graduationYear?.toString() ?? "N/A"],
    ["Degree type", student.degreeType ?? "N/A"]
  ].forEach(([label, value]) => doc.text(`${label}: ${value}`));

  doc.moveDown();
  doc.fontSize(14).text("Uploaded Documents");
  doc.fontSize(10);
  submission.documents.forEach((file, index) => {
    doc.text(`${index + 1}. ${file.documentType} - ${file.fileName} (${Math.round(file.size / 1024)} KB)`);
  });

  doc.moveDown();
  doc.fontSize(14).text("Missing Documents");
  doc.fontSize(10);
  if (submission.missingDocuments?.length) {
    submission.missingDocuments.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.documentRequirement.label} - ${item.note ?? "Required"}`);
    });
  } else {
    doc.text("None. The submitted file is complete.");
  }
  doc.moveDown();
  if (submission.receiptQrCode) {
    doc.text("QR code is stored with the receipt metadata and displayed in the web dashboard.");
  }
  doc.text(`Administrative notes: ${submission.adminNotes ?? "None"}`);
  doc.end();
  return done;
};

export const buildVerificationPdf = async (
  verification: VerificationRecord & { student: StudentProfile & { user: User }; submission: DocumentSubmission }
) => {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const done = collectPdf(doc);
  const student = verification.student;

  doc.fontSize(18).text("Certificate Validity Confirmation Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Verification code: ${verification.verificationCode}`);
  doc.text(`Verification date: ${verification.generatedAt.toISOString()}`);
  doc.text(`Validity status: ${verification.isValid ? "VALID" : "INVALID"}`);
  doc.text(`Blockchain network: ${verification.blockchainNetwork ?? "Not configured"}`);
  doc.text(`Blockchain transaction: ${verification.blockchainTxHash ?? "Not available"}`);
  doc.text(`Contract address: ${verification.contractAddress ?? "Not available"}`);
  doc.text("Digital signature: Tawtheeq.dz placeholder seal for MVP; ready for certification authority integration.");
  doc.moveDown();
  doc.fontSize(14).text("Graduate Record");
  doc.fontSize(10);
  doc.text(`Full name: ${student.user.fullName}`);
  doc.text(`Degree: ${student.degreeType ?? "N/A"}`);
  doc.text(`Specialty: ${student.specialty ?? "N/A"}`);
  doc.text(`Graduation year: ${student.graduationYear ?? "N/A"}`);
  doc.text(`University: ${student.university ?? "N/A"}`);
  doc.moveDown();
  doc.text("This document is generated from the protected academic authentication platform.");
  doc.end();
  return done;
};
