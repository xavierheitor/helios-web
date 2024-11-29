import { z } from "zod";

export const BaseFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "O nome da base é obrigatório!" })
    .max(255, { message: "O nome da base não pode exceder 255 caracteres!" }), // Nome da base com validação
  createdByUser: z
    .string()
    .nullable()
    .optional()
    .refine((value) => (value ? !isNaN(Number(value)) : true), {
      message: "O ID do usuário deve ser um número válido!",
    })
    .transform((value) => (value ? Number(value) : null)), // Converte o ID do usuário para número, se presente
  contractId: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "O ID do contrato é obrigatório e deve ser um número válido!",
    })
    .transform((value) => Number(value)), // Converte o ID do contrato para número
});
