import { z } from "zod";

export const RoleFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "O nome do cargo é obrigatório!" })
    .max(255, { message: "O nome do cargo não pode exceder 255 caracteres!" }), // Nome com validação
  description: z
    .string()
    .max(1000, { message: "A descrição não pode exceder 1000 caracteres!" })
    .nullable()
    .optional(), // Descrição opcional
  baseSalary: z
    .string()
    .optional()
    .refine((value) => (value ? !isNaN(Number(value)) : true), {
      message: "O salário base deve ser um número válido!",
    })
    .transform((value) => (value ? Number(value) : undefined)), // Converte salário base para número, se presente

  deletedAt: z.date().nullable().optional(), // Data de exclusão lógica, opcional
});
