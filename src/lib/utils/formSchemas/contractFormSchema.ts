import { z } from "zod";

export const ContractFormSchema = z.object({
  id: z.number().int().positive().optional(), // ID opcional para edições
  number: z
    .string()
    .min(1, { message: "O número do contrato é obrigatório!" })
    .max(20, {
      message: "O número do contrato não pode exceder 20 caracteres!",
    }), // Validação para o número único do contrato
  name: z
    .string()
    .min(1, { message: "O nome do contrato é obrigatório!" })
    .max(100, {
      message: "O nome do contrato não pode exceder 100 caracteres!",
    }), // Nome do contrato com validação
  initialDate: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "A data de início deve ser uma data válida!",
    })
    .transform((value) => new Date(value)), // Transforma a string em objeto Date
  finalDate: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "A data de término deve ser uma data válida!",
    })
    .transform((value) => new Date(value)), // Transforma a string em objeto Date
  contractorId: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "O ID do contratante deve ser um número positivo!",
    })
    .transform((value) => Number(value)), // Transforma a string em número
});
