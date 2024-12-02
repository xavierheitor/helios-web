"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../types/actions/action-result";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";

export async function deleteEquipe(id: number): Promise<ActionResult> {
  logger.info(`deleteVeiculo action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_equipe,
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
    const equipe = await prisma.team.findUnique({ where: { id } });

    if (!equipe) {
      logger.error(`Equipe ${id} não encontrada`);
      return {
        success: false,
        message: "Equipe não encontrada",
      };
    }

    await prisma.softDelete("team", { id });

    logger.info(`Equipe ${id} deletada com sucesso`);
    return {
      success: true,
      message: "Equipe deletada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar equipe: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar equipe", { error });
      return {
        success: false,
        message: "Erro desconhecido ao deletar equipe",
      };
    }
  }
}
