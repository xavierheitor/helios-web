// src/lib/utils/formSchemas/deviceFormSchema.ts
import { z } from "zod";

export const DeviceFormSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z
    .string()
    .min(1, { message: "O nome do dispositivo é obrigatório!" })
    .max(100, {
      message: "O nome do dispositivo não pode exceder 100 caracteres!",
    })
    .transform((value) => value.toUpperCase()),
  deviceUniqueId: z
    .string()
    .min(1, { message: "O identificador único do dispositivo é obrigatório!" })
    .max(255, {
      message: "O identificador único não pode exceder 255 caracteres!",
    }),
  contractIds: z.array(z.number().int().positive()).optional(), // IDs dos contratos selecionados
});
