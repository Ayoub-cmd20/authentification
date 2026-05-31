import { z } from "zod";

export const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/);

export const studentProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  nationalId: z.string().min(3).optional().nullable(),
  studentRegistrationNumber: z.string().min(2).optional().nullable(),
  university: z.string().optional().nullable(),
  faculty: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  graduationYear: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  degreeType: z.string().optional().nullable()
});

export const studentRegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  studentRegistrationNumber: z.string().optional()
});

export const institutionRegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().optional(),
  institutionName: z.string().min(2),
  institutionType: z.string().min(2),
  licenseNumber: z.string().optional(),
  taxId: z.string().optional(),
  contactPerson: z.string().optional(),
  address: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
