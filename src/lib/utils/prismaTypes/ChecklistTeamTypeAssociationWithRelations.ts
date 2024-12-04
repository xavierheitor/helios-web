// lib/utils/prismaTypes/checklistTeamTypeAssociationWithRelations.ts

import {
  Checklist,
  ChecklistTeamTypeAssociation,
  TeamType,
  User,
} from "@prisma/client";

export type ChecklistTeamTypeAssociationWithRelations =
  ChecklistTeamTypeAssociation & {
    checklist: Checklist;
    teamType: TeamType;
    createdBy: User | null;
  };
