import { z } from "zod";

export const ContractPermissionsFormSchema = z.object({
  id: z.number().int().positive().optional(), // ID opcional para edições
  contractId: z
    .number()
    .int()
    .positive({ message: "Contrato inválido!" })
    .optional(), // Campo obrigatório ao criar
  userId: z.number().int().positive(), // ID do usuário
  contrato: z.string().optional(), // Nome do contrato é opcional
  canView: z.boolean().default(false), // Pode visualizar
  canCreate: z.boolean().default(false), // Pode criar
  canEdit: z.boolean().default(false), // Pode editar
  canDelete: z.boolean().default(false), // Pode deletar
});
