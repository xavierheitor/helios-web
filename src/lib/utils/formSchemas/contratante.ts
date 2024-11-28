import { z } from "zod";

export const ContractorFormSchema = z.object({
  id: z.number().int().positive().optional(), // ID opcional para edições
  name: z
    .string()
    .min(1, { message: "O nome do contratante é obrigatório!" })
    .max(100, {
      message: "O nome do contratante não pode exceder 100 caracteres!",
    }),
  cnpj: z
    .string()
    .length(14, { message: "O CNPJ deve conter exatamente 14 caracteres!" })
    .regex(/^\d+$/, { message: "O CNPJ deve conter apenas números!" }),
  state: z
    .string()
    .length(2, { message: "O estado deve conter exatamente 2 caracteres!" })
    .regex(/^[A-Z]{2}$/, {
      message: "O estado deve conter apenas letras maiúsculas!",
    }),
  createdAt: z.date().optional(), // Opcional, pois pode ser gerado automaticamente
  updatedAt: z.date().optional(), // Opcional, pois pode ser atualizado automaticamente
  deletedAt: z.date().nullable().optional(), // Pode ser nulo ou ausente
});
