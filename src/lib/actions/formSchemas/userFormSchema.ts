import { z } from "zod";

export const UserFormSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z
    .string()
    .min(1, { message: "O nome é obrigatório" })
    .max(100, { message: "O nome não pode exceder 100 caracteres" }),
  username: z
    .string()
    .min(1, { message: "O usuário é obrigatório" })
    .max(50, { message: "O usuário não pode exceder 50 caracteres" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" })
    .max(100, { message: "A senha não pode exceder 100 caracteres" })
    .optional()
    .nullable(),
  confirmPassword: z.string().nullable().or(z.literal("")),
});
