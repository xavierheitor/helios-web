"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ActionResult } from "../../../../../../types/actions/action-result";

export async function deleteChecklistTeamTypeAssociation(
  id: number
): Promise<ActionResult> {
  logger.info(`deleteChecklistTeamTypeAssociation action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_associacao,
    PERMISSIONS.DELETE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  try {
    const association = await prisma.checklistTeamTypeAssociation.findUnique({
      where: { id },
    });

    if (!association) {
      logger.error(`Associação ${id} não encontrada`);
      return {
        success: false,
        message: "Associação não encontrada.",
      };
    }

    await prisma.checklistTeamTypeAssociation.delete({
      where: { id },
    });

    logger.info(
      `Associação ${id} deletada com sucesso pelo usuário ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Associação deletada com sucesso.",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar associação: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar associação", { error });
      return {
        success: false,
        message: "Erro desconhecido ao deletar associação.",
      };
    }
  }
}
