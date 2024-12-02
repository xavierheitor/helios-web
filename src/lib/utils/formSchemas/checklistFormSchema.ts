// src/lib/utils/formSchemas/checklistFormSchema.ts
import { z } from "zod";

export const ChecklistFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z
    .string()
    .min(1, "O nome do checklist é obrigatório.")
    .max(100, "O nome não pode exceder 100 caracteres."),
  description: z
    .string()
    .max(255, "A descrição não pode exceder 255 caracteres.")
    .nullable()
    .optional(),
  checklistTypeId: z.coerce
    .number()
    .int()
    .positive({ message: "O tipo de checklist é obrigatório." }),
  questionsIds: z.array(z.number().int().positive()).optional(),
});
