// src/lib/utils/formSchemas/checklistTypeFormSchema.ts
import { z } from "zod";

export const ChecklistTypeFormSchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório.")
    .max(100, "O nome não pode exceder 100 caracteres."),
  description: z
    .string()
    .max(255, "A descrição não pode exceder 255 caracteres.")
    .nullable()
    .optional(),
});
