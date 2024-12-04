"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ChecklistTeamTypeAssociationWithRelations } from "@/lib/utils/prismaTypes/ChecklistTeamTypeAssociationWithRelations";
import { FormState } from "../../../../../../types/actions/form-state";

export async function fetchSWRChecklistTeamTypeAssociations(): Promise<
  ChecklistTeamTypeAssociationWithRelations[]
> {
  logger.info("fetchSWRChecklistTeamTypeAssociations action called");

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
    const associations = await prisma.checklistTeamTypeAssociation.findMany({
      include: {
        teamType: true,
        checklist: true,
        createdBy: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${associations.length} associações de tipo de equipe`
    );

    return associations;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(
        `Erro ao buscar associações de tipo de equipe: ${error.message}`,
        { error }
      );
      throw new SWRError(error.message);
    } else {
      logger.error(
        "Erro desconhecido ao buscar associações de tipo de equipe",
        { error }
      );
      throw new SWRError(
        "Erro desconhecido ao buscar associações de tipo de equipe"
      );
    }
  }
}
