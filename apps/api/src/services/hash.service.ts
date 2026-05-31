import crypto from "node:crypto";
import fs from "node:fs/promises";
import type { StudentDocument, StudentProfile, User } from "@prisma/client";
import { env } from "../config/env.js";

export const sha256Hex = (value: string | Buffer) => `0x${crypto.createHash("sha256").update(value).digest("hex")}`;

export const hashWithSecret = (value: string) => sha256Hex(`${env.HASH_SECRET}:${value}`);

export const buildDocumentHash = async (documents: StudentDocument[]) => {
  const parts = await Promise.all(
    documents
      .slice()
      .sort((a, b) => a.documentType.localeCompare(b.documentType) || a.fileName.localeCompare(b.fileName))
      .map(async (document) => {
        const file = await fs.readFile(document.filePath);
        return `${document.documentType}:${sha256Hex(file)}:${document.size}`;
      })
  );

  return sha256Hex(parts.join("|"));
};

export const buildStudentHash = (registrationNumber: string | null | undefined) =>
  hashWithSecret(registrationNumber ?? "missing-registration-number");

export const buildDegreeHash = (student: StudentProfile & { user?: User }) =>
  hashWithSecret(
    JSON.stringify({
      university: student.university,
      faculty: student.faculty,
      department: student.department,
      specialty: student.specialty,
      graduationYear: student.graduationYear,
      degreeType: student.degreeType
    })
  );
