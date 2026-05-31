import { prisma } from "../config/prisma.js";

export class ProgressIntegrationService {
  async findStudentByNIN(nin: string) {
    return prisma.studentProfile.findFirst({ where: { OR: [{ nin }, { nationalId: nin }] }, include: { user: true } });
  }

  async findStudentByRegistrationNumber(studentRegistrationNumber: string) {
    return prisma.studentProfile.findUnique({ where: { studentRegistrationNumber }, include: { user: true } });
  }

  async validateAcademicPath(input: { nin?: string | null; studentRegistrationNumber?: string | null; certificateNumber?: string | null }) {
    const matched =
      (input.studentRegistrationNumber ? await this.findStudentByRegistrationNumber(input.studentRegistrationNumber) : null) ??
      (input.nin ? await this.findStudentByNIN(input.nin) : null);

    return {
      valid: Boolean(matched),
      source: "MOCK_PROGRESS",
      matchedStudentId: matched?.id,
      certificateNumber: input.certificateNumber ?? matched?.certificateNumber
    };
  }

  async validateCertificateNumber(certificateNumber: string) {
    const profile = await prisma.studentProfile.findFirst({ where: { certificateNumber }, include: { user: true } });
    return { valid: Boolean(profile), source: "MOCK_PROGRESS", profile };
  }
}

export const progressIntegrationService = new ProgressIntegrationService();
