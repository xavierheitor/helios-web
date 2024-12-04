"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ChecklistVehicleTypeAssociationWithRelations } from "@/lib/utils/prismaTypes/checklistVehicleTypeAssociationWithRelations";

export async function fetchSWRChecklistVehicleTypeAssociations(): Promise<
  ChecklistVehicleTypeAssociationWithRelations[]
> {
  logger.info("fetchSWRChecklistVehicleTypeAssociations action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_associacao,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const associations = await prisma.checklistVehicleTypeAssociation.findMany({
      include: {
        vehicleType: true,
        createdBy: true,
        checklist: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${associations.length} associações de tipo de veículo`
    );

    return associations;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(
        `Erro ao buscar associações de tipo de veículo: ${error.message}`,
        { error }
      );
      throw new SWRError(error.message);
    } else {
      logger.error(
        "Erro desconhecido ao buscar associações de tipo de veículo",
        { error }
      );
      throw new SWRError(
        "Erro desconhecido ao buscar associações de tipo de veículo"
      );
    }
  }
}
