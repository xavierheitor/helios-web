import { z } from "zod";

export const TeamFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "O nome do time é obrigatório!" })
    .max(100, { message: "O nome do time não pode exceder 100 caracteres!" })
    .transform((value) => value.toUpperCase()), // Transforma o nome para uppercase
  contractId: z
    .union([z.string(), z.number()]) // Aceita string ou número
    .transform((value) =>
      typeof value === "string" ? parseInt(value, 10) : value
    ) // Converte para número
    .refine((value) => !isNaN(value), {
      message: "O ID do contrato deve ser um número válido!",
    })
    .refine((value) => value > 0, {
      message: "O ID do contrato é obrigatório e deve ser válido!",
    }),
  teamTypeId: z
    .union([z.string(), z.number()]) // Aceita string ou número
    .transform((value) =>
      typeof value === "string" ? parseInt(value, 10) : value
    ) // Converte para número
    .refine((value) => !isNaN(value), {
      message: "O ID do tipo de time deve ser um número válido!",
    })
    .refine((value) => value > 0, {
      message: "O ID do tipo de time é obrigatório e deve ser válido!",
    }),
});
