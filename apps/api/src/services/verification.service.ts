import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { blockchainMetadata, isBlockchainEnabled, registerCertificateOnChain } from "./blockchain.service.js";
import { buildDegreeHash, buildDocumentHash, buildStudentHash, hashWithSecret } from "./hash.service.js";

export const generateVerificationCode = () => {
  const year = new Date().getFullYear();
  return `UAP-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
};

export const createVerificationRecord = async (submissionId: string, generatedById: string) => {
  const submission = await prisma.documentSubmission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { student: { include: { user: true } }, documents: true }
  });
  const verificationCode = generateVerificationCode();
  const verificationCodeHash = hashWithSecret(verificationCode);
  const documentHash = await buildDocumentHash(submission.documents);
  const studentHash = buildStudentHash(submission.student.studentRegistrationNumber);
  const degreeHash = buildDegreeHash(submission.student);
  const publicUrl = `${env.WEB_APP_URL}/verify/${verificationCode}`;
  const qrCodeUrl = await QRCode.toDataURL(publicUrl);
  const metadata = blockchainMetadata();
  const blockchainTxHash = isBlockchainEnabled()
    ? await registerCertificateOnChain({ verificationCodeHash, documentHash, studentHash, degreeHash })
    : undefined;

  return prisma.verificationRecord.create({
    data: {
      studentId: submission.studentId,
      submissionId: submission.id,
      verificationCode,
      verificationCodeHash,
      documentHash,
      studentHash,
      degreeHash,
      blockchainTxHash,
      blockchainNetwork: metadata.blockchainNetwork,
      contractAddress: metadata.contractAddress,
      qrCodeUrl,
      generatedById
    }
  });
};
