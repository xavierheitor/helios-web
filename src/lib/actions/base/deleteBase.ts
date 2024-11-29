"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";

export async function deleteBase(id: number): Promise<ActionResult> {
  logger.info(`deleteBase action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_base,
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
    const base = await prisma.base.findUnique({ where: { id } });

    if (!base) {
      logger.error(`Base ${id} não encontrada`);
      return {
        success: false,
        message: "Base não encontrada",
      };
    }

    await prisma.softDelete("base", { id });

    logger.info(`Base ${id} deletada com sucesso`);
    return {
      success: true,
      message: "Base deletada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar base: ${error.message}`, { error });
    } else {
      logger.error("Erro desconhecido ao deletar base", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar a base.",
    };
  }
}
