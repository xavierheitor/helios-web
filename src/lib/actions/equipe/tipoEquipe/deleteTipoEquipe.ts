"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { MenuKeys } from "@/enums/menus";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";

export async function deleteTipoEquipe(id: number): Promise<ActionResult> {
  logger.info(`deleteTipoEquipe action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoEquipe,
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
    const tipoEquipe = await prisma.teamType.findUnique({ where: { id } });

    if (!tipoEquipe) {
      logger.error(`Tipo de equipe ${id} não encontrado`);
      return {
        success: false,
        message: "Tipo de equipe não encontrado",
      };
    }

    await prisma.softDelete("teamType", { id });

    logger.info(
      `Tipo de equipe ${id} deletado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Tipo de equipe deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar tipo de equipe: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar tipo de equipe", { error });
      return {
        success: false,
        message: "Erro desconhecido ao deletar tipo de equipe",
      };
    }
  }
}
