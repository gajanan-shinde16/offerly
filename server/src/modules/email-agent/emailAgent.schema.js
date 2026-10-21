
import { z } from "zod";

export const reviewSuggestionSchema = z.object({
  decision: z.enum(["approve", "reject"])
});
