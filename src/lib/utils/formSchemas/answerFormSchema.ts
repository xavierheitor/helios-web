import { z } from "zod";

export const AnswerFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  text: z
    .string()
    .min(1, "O texto da resposta é obrigatório.")
    .max(255, "O texto não pode exceder 255 caracteres."),
  checklistTypeId: z.coerce
    .number()
    .int()
    .positive({ message: "O tipo de checklist é obrigatório." }),
  pending: z.preprocess((value) => {
    if (typeof value === "string") {
      return value === "true";
    }
    return Boolean(value);
  }, z.boolean()),
});
