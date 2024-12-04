import z from "zod";

// **Schema de Validação com Zod**
export const EditChecklistTeamTypeAssociationSchema = z.object({
  id: z.number().positive(),
  teamTypeId: z.number().positive(),
});

export const ChecklistTeamTypeAssociationSchema = z.object({
  checklistId: z.number().positive(),
  teamTypeId: z.number().positive(),
});
