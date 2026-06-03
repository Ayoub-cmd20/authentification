import { type StudentDocument } from "@prisma/client";
import { CompletenessStatus, DocumentType, DocumentValidationStatus } from "../constants/prismaEnums.js";
import { prisma } from "../config/prisma.js";

const fallbackRequired = [
  DocumentType.BACCALAUREATE_TRANSCRIPT,
  DocumentType.UNIVERSITY_TRANSCRIPTS,
  DocumentType.GRADUATION_CERTIFICATE
];

export const evaluateSubmissionCompleteness = async (
  submissionId: string,
  documents: Pick<StudentDocument, "documentType" | "mimeType" | "size">[]
) => {
  const requirements = await prisma.documentRequirement.findMany({
    where: { isActive: true, isRequired: true },
    orderBy: { sortOrder: "asc" }
  });
  const requiredTypes = requirements.length ? requirements.map((item) => item.documentType) : fallbackRequired;
  const uploaded = new Set<string>();
  const duplicateTypes = new Set<string>();

  for (const document of documents) {
    if (uploaded.has(document.documentType)) duplicateTypes.add(document.documentType);
    uploaded.add(document.documentType);
  }

  const missingTypes = requiredTypes.filter((type) => !uploaded.has(type));
  await prisma.missingDocument.deleteMany({ where: { submissionId } });

  for (const type of missingTypes) {
    const requirement =
      requirements.find((item) => item.documentType === type) ??
      (await prisma.documentRequirement.upsert({
        where: { documentType: type },
        update: {},
        create: {
          documentType: type,
          label: type.replaceAll("_", " ").toLowerCase(),
          code: type,
          name: type.replaceAll("_", " "),
          isRequired: true
        }
      }));
    await prisma.missingDocument.create({
      data: {
        submissionId,
        documentRequirementId: requirement.id,
        note: "Required for academic path authentication"
      }
    });
  }

  return {
    completenessStatus: missingTypes.length ? CompletenessStatus.INCOMPLETE : CompletenessStatus.COMPLETE,
    missingTypes,
    duplicateTypes: [...duplicateTypes],
    uploadStatus: documents.length ? DocumentValidationStatus.VALID : DocumentValidationStatus.PENDING
  };
};
