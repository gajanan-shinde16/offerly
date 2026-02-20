import { z } from "zod";

//CREATE APPLICATION
export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  package: z.number().nonnegative("Package must be >= 0"),
  rounds: z.array(z.string().min(1)).min(1, "At least one round is required"),
  currentRound: z.string().min(1, "Current round is required"),
  status: z.enum(["In-Progress", "Offer", "Rejected"])
});

//INLINE STATUS UPDATE
export const updateStatusSchema = z.object({
  status: z.enum(["In-Progress", "Offer", "Rejected"]),
  currentRound: z.string().optional()
});

//FULL UPDATE
export const updateApplicationSchema = z.object({
  company: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  package: z.number().nonnegative(),
  rounds: z.array(z.string().min(1)).min(1),
  currentRound: z.string().optional().or(z.literal("")),
  status: z.enum(["In-Progress", "Offer", "Rejected"])
});
