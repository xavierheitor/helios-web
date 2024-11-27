import { z } from "zod";

export const ModulePermissionsFormSchema = z.object({
  id: z.number().int().positive().optional(), // ID opcional para edições
  userId: z.number().int().positive(), // ID do usuário
  module: z.string().min(1, { message: "Módulo é obrigatório" }), // Nome do módulo é obrigatório
  canView: z.boolean().default(false), // Pode visualizar
  canCreate: z.boolean().default(false), // Pode criar
  canEdit: z.boolean().default(false), // Pode editar
  canDelete: z.boolean().default(false), // Pode deletar
});
