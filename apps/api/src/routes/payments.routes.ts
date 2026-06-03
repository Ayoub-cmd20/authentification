import { Router } from "express";
import { PaymentProvider, UserRole, type PaymentProvider as PaymentProviderValue } from "../constants/prismaEnums.js";
import { prisma } from "../config/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createMockPaymentIntent, markMockPaymentPaid } from "../services/payment.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/errors.js";
import type { AuthRequest } from "../types.js";

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.post(
  "/create",
  requireRole(UserRole.STUDENT, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: AuthRequest, res) => {
    const submissionId = req.body.submissionId as string | undefined;
    if (submissionId) {
      const submission = await prisma.documentSubmission.findFirst({
        where: { id: submissionId, student: { userId: req.user!.id } }
      });
      if (!submission && req.user!.role !== UserRole.SUPER_ADMIN) throw notFound("Submission");
    }

    const provider = (req.body.provider as PaymentProviderValue | undefined) ?? PaymentProvider.MOCK;
    if (!Object.values(PaymentProvider).includes(provider)) throw new AppError(400, "Unsupported payment provider");
    const payment = await createMockPaymentIntent({
      userId: req.user!.id,
      submissionId,
      provider,
      amount: req.body.amount ? Number(req.body.amount) : undefined
    });
    res.status(201).json(payment);
  })
);

paymentsRouter.post(
  "/mock-success",
  requireRole(UserRole.STUDENT, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: AuthRequest, res) => {
    const payment = await markMockPaymentPaid(req.body.paymentId, req.user!.role === UserRole.SUPER_ADMIN ? undefined : req.user!.id);
    res.json(payment);
  })
);

paymentsRouter.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) throw notFound("Payment");
    if (req.user!.role !== UserRole.SUPER_ADMIN && payment.userId !== req.user!.id) throw new AppError(403, "Forbidden");
    res.json(payment);
  })
);
