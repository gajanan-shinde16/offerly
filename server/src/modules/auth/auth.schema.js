import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  college: z.string().optional(),
  graduationYear: z.number().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});
