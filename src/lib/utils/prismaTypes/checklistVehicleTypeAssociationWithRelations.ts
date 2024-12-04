// lib/utils/prismaTypes/checklistVehicleTypeAssociationWithRelations.ts

import {
  ChecklistVehicleTypeAssociation,
  VehicleType,
  User,
  Checklist,
} from "@prisma/client";

export type ChecklistVehicleTypeAssociationWithRelations =
  ChecklistVehicleTypeAssociation & {
    checklist: Checklist;
    vehicleType: VehicleType;
    createdBy: User | null;
  };
