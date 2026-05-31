import { randomUUID } from "node:crypto";
import { AuditAction, PaymentProvider, PaymentStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { audit } from "./audit.service.js";
import { AppError, notFound } from "../utils/errors.js";

export const createMockPaymentIntent = async (input: {
  userId: string;
  submissionId?: string;
  provider?: PaymentProvider;
  amount?: number;
}) => {
  const provider = input.provider ?? PaymentProvider.MOCK;
  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      submissionId: input.submissionId,
      provider,
      amount: input.amount ?? 1500,
      currency: "DZD",
      transactionReference: `TWQ-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`
    }
  });

  if (input.submissionId) {
    await prisma.documentSubmission.update({ where: { id: input.submissionId }, data: { paymentId: payment.id } });
  }

  await audit({
    userId: input.userId,
    action: AuditAction.PAYMENT_CREATED,
    entityType: "Payment",
    entityId: payment.id,
    details: { provider, amount: payment.amount.toString() }
  });

  return payment;
};

export const markMockPaymentPaid = async (paymentId: string, userId?: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw notFound("Payment");
  if (userId && payment.userId !== userId) throw new AppError(403, "Payment does not belong to this account");

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.PAID, paidAt: new Date() }
  });
  await audit({ userId: payment.userId, action: AuditAction.PAYMENT_PAID, entityType: "Payment", entityId: payment.id });
  return updated;
};

export const isSubmissionPaid = async (submissionId: string) => {
  const submission = await prisma.documentSubmission.findUnique({
    where: { id: submissionId },
    include: { payment: true }
  });
  return submission?.payment?.status === PaymentStatus.PAID;
};
