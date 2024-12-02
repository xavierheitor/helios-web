import { z } from "zod";

export const TeamTypeFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "O nome do tipo de time é obrigatório!" })
    .max(100, {
      message: "O nome do tipo de time não pode exceder 100 caracteres!",
    }),
  description: z
    .string()
    .max(255, { message: "A descrição não pode exceder 255 caracteres!" })
    .nullable()
    .optional(), // Pode ser nulo ou ausente
});
