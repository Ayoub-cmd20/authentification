import {
  AuditAction as PrismaAuditAction,
  CompletenessStatus as PrismaCompletenessStatus,
  DigitalSignatureStatus as PrismaDigitalSignatureStatus,
  DocumentType as PrismaDocumentType,
  DocumentValidationStatus as PrismaDocumentValidationStatus,
  PaymentProvider as PrismaPaymentProvider,
  PaymentStatus as PrismaPaymentStatus,
  SubmissionStatus as PrismaSubmissionStatus,
  SubscriptionStatus as PrismaSubscriptionStatus,
  SubscriptionTier as PrismaSubscriptionTier,
  UserRole as PrismaUserRole
} from "@prisma/client";
import type {
  AuditAction as PrismaAuditActionValue,
  CompletenessStatus as PrismaCompletenessStatusValue,
  DigitalSignatureStatus as PrismaDigitalSignatureStatusValue,
  DocumentType as PrismaDocumentTypeValue,
  DocumentValidationStatus as PrismaDocumentValidationStatusValue,
  PaymentProvider as PrismaPaymentProviderValue,
  PaymentStatus as PrismaPaymentStatusValue,
  SubmissionStatus as PrismaSubmissionStatusValue,
  SubscriptionStatus as PrismaSubscriptionStatusValue,
  SubscriptionTier as PrismaSubscriptionTierValue,
  UserRole as PrismaUserRoleValue
} from "@prisma/client";

export const UserRole = PrismaUserRole;
export type UserRole = PrismaUserRoleValue;
export const isUserRole = (value: string): value is UserRole =>
  Object.values(UserRole).includes(value as UserRole);

export const SubmissionStatus = PrismaSubmissionStatus;
export type SubmissionStatus = PrismaSubmissionStatusValue;

export const CompletenessStatus = PrismaCompletenessStatus;
export type CompletenessStatus = PrismaCompletenessStatusValue;

export const DocumentType = PrismaDocumentType;
export type DocumentType = PrismaDocumentTypeValue;

export const AuditAction = PrismaAuditAction;
export type AuditAction = PrismaAuditActionValue;

export const PaymentProvider = PrismaPaymentProvider;
export type PaymentProvider = PrismaPaymentProviderValue;

export const PaymentStatus = PrismaPaymentStatus;
export type PaymentStatus = PrismaPaymentStatusValue;

export const SubscriptionStatus = PrismaSubscriptionStatus;
export type SubscriptionStatus = PrismaSubscriptionStatusValue;

export const SubscriptionTier = PrismaSubscriptionTier;
export type SubscriptionTier = PrismaSubscriptionTierValue;

export const DocumentValidationStatus = PrismaDocumentValidationStatus;
export type DocumentValidationStatus = PrismaDocumentValidationStatusValue;

export const DigitalSignatureStatus = PrismaDigitalSignatureStatus;
export type DigitalSignatureStatus = PrismaDigitalSignatureStatusValue;
