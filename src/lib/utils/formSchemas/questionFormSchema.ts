import { z } from "zod";

export const QuestionFormSchema = z.object({
  text: z
    .string()
    .min(1, "O texto da pergunta é obrigatório.")
    .max(255, "O texto não pode exceder 255 caracteres."),
  checklistTypeId: z.coerce
    .number()
    .int()
    .positive({ message: "O tipo de checklist é obrigatório." }),
});
