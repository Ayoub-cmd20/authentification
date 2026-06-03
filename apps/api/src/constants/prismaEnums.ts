export const UserRole = {
  STUDENT: "STUDENT",
  UNIVERSITY_ADMIN: "UNIVERSITY_ADMIN",
  INSTITUTION: "INSTITUTION",
  MINISTRY_ADMIN: "MINISTRY_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const isUserRole = (value: string): value is UserRole =>
  Object.values(UserRole).includes(value as UserRole);

export const SubmissionStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  INCOMPLETE: "INCOMPLETE",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  APPROVED: "APPROVED",
  ARCHIVED: "ARCHIVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED"
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const CompletenessStatus = {
  COMPLETE: "COMPLETE",
  INCOMPLETE: "INCOMPLETE"
} as const;
export type CompletenessStatus = (typeof CompletenessStatus)[keyof typeof CompletenessStatus];

export const DocumentType = {
  BACCALAUREATE_TRANSCRIPT: "BACCALAUREATE_TRANSCRIPT",
  UNIVERSITY_TRANSCRIPTS: "UNIVERSITY_TRANSCRIPTS",
  GRADUATION_CERTIFICATE: "GRADUATION_CERTIFICATE",
  ACADEMIC_LEAVE: "ACADEMIC_LEAVE",
  FAILED_YEAR_TRANSCRIPT: "FAILED_YEAR_TRANSCRIPT",
  DEBT_CLEARANCE: "DEBT_CLEARANCE",
  INTERRUPTION_CERTIFICATE: "INTERRUPTION_CERTIFICATE",
  TRANSFER_FORM: "TRANSFER_FORM",
  PREVIOUS_UNIVERSITY_DOCUMENTS: "PREVIOUS_UNIVERSITY_DOCUMENTS",
  OTHER: "OTHER"
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const AuditAction = {
  LOGIN: "LOGIN",
  FAILED_LOGIN: "FAILED_LOGIN",
  LOGOUT: "LOGOUT",
  STUDENT_REGISTRATION: "STUDENT_REGISTRATION",
  INSTITUTION_REGISTRATION: "INSTITUTION_REGISTRATION",
  FILE_SUBMISSION: "FILE_SUBMISSION",
  FILE_APPROVAL: "FILE_APPROVAL",
  FILE_REJECTION: "FILE_REJECTION",
  FILE_INCOMPLETE: "FILE_INCOMPLETE",
  FILE_ARCHIVED: "FILE_ARCHIVED",
  VERIFICATION_GENERATED: "VERIFICATION_GENERATED",
  PAYMENT_CREATED: "PAYMENT_CREATED",
  PAYMENT_PAID: "PAYMENT_PAID",
  PDF_REPORT_GENERATED: "PDF_REPORT_GENERATED",
  BLOCKCHAIN_CERTIFICATE_REGISTERED: "BLOCKCHAIN_CERTIFICATE_REGISTERED",
  BLOCKCHAIN_CERTIFICATE_REVOKED: "BLOCKCHAIN_CERTIFICATE_REVOKED",
  INSTITUTION_SEARCH: "INSTITUTION_SEARCH",
  ACCOUNT_STATUS_CHANGED: "ACCOUNT_STATUS_CHANGED",
  ROLE_CHANGED: "ROLE_CHANGED",
  DOCUMENT_REQUIREMENT_UPDATED: "DOCUMENT_REQUIREMENT_UPDATED",
  PROFILE_UPDATED: "PROFILE_UPDATED",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED"
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const PaymentProvider = {
  MOCK: "MOCK",
  EDAHABIA: "EDAHABIA",
  CIB: "CIB",
  GIE_MONETIQUE: "GIE_MONETIQUE"
} as const;
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED"
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  SUSPENDED: "SUSPENDED",
  PENDING_PAYMENT: "PENDING_PAYMENT"
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const SubscriptionTier = {
  BASIC: "BASIC",
  PROFESSIONAL: "PROFESSIONAL",
  ENTERPRISE: "ENTERPRISE"
} as const;
export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

export const DocumentValidationStatus = {
  PENDING: "PENDING",
  VALID: "VALID",
  INVALID: "INVALID"
} as const;
export type DocumentValidationStatus = (typeof DocumentValidationStatus)[keyof typeof DocumentValidationStatus];

export const DigitalSignatureStatus = {
  PENDING: "PENDING",
  SEALED_PLACEHOLDER: "SEALED_PLACEHOLDER",
  SIGNED: "SIGNED",
  FAILED: "FAILED",
  VERIFIED: "VERIFIED"
} as const;
export type DigitalSignatureStatus = (typeof DigitalSignatureStatus)[keyof typeof DigitalSignatureStatus];
