"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../types/actions/action-result";
import { MenuKeys } from "@/enums/menus";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";

export async function deleteContratante(id: number): Promise<ActionResult> {
  logger.info(`deleteContratante action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contratante,
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
    const contratante = await prisma.contractor.findUnique({ where: { id } });

    if (!contratante) {
      logger.error(`Contratante ${id} não encontrado`);
      return {
        success: false,
        message: "Contratante não encontrado",
      };
    }

    await prisma.softDelete("contractor", { id });

    logger.info(`Contratante ${id} deletado com sucesso`);
    return {
      success: true,
      message: "Contratante deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar contratante: ${error.message}`, { error });
    } else {
      logger.error("Erro desconhecido ao deletar contratante", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar o contratante.",
    };
  }
}
