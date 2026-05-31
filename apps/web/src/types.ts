export type Role = "STUDENT" | "UNIVERSITY_ADMIN" | "INSTITUTION" | "MINISTRY_ADMIN" | "SUPER_ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone?: string | null;
  isActive: boolean;
};

export type Status =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INCOMPLETE"
  | "VERIFIED"
  | "APPROVED"
  | "ARCHIVED"
  | "REJECTED"
  | "COMPLETED";

export type StudentProfile = {
  id: string;
  userId: string;
  user: { fullName: string; email: string; phone?: string | null };
  dateOfBirth?: string | null;
  nationalId?: string | null;
  studentRegistrationNumber?: string | null;
  university?: string | null;
  faculty?: string | null;
  department?: string | null;
  specialty?: string | null;
  graduationYear?: number | null;
  degreeType?: string | null;
  certificateNumber?: string | null;
};

export type StudentDocument = {
  id: string;
  submissionId: string;
  documentType: string;
  fileName: string;
  size: number;
  uploadedAt: string;
};

export type Submission = {
  id: string;
  studentId: string;
  status: Status;
  adminNotes?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  documents: StudentDocument[];
  missingDocuments?: { id: string; note?: string | null; documentRequirement: { label: string; documentType: string } }[];
  payment?: { id: string; status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"; transactionReference: string; amount: string } | null;
  student?: StudentProfile;
  verificationRecords?: VerificationRecord[];
};

export type VerificationRecord = {
  id: string;
  verificationCode: string;
  verificationCodeHash?: string | null;
  documentHash?: string | null;
  studentHash?: string | null;
  degreeHash?: string | null;
  blockchainTxHash?: string | null;
  blockchainNetwork?: string | null;
  contractAddress?: string | null;
  qrCodeUrl?: string | null;
  isValid: boolean;
  generatedAt: string;
  revokedAt?: string | null;
  student?: StudentProfile;
};
