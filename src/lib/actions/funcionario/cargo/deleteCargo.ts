"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ActionResult } from "../../../../../types/actions/action-result";

export async function deleteCargo(id: number): Promise<ActionResult> {
  logger.info(`deleteCargo action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contrato,
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
    const cargo = await prisma.role.findUnique({ where: { id } });

    if (!cargo) {
      logger.error(`Cargo ${id} não encontrado`);
      return {
        success: false,
        message: "Cargo não encontrado",
      };
    }

    await prisma.softDelete("role", { id });

    logger.info(`Cargo ${id} deletado com sucesso`);
    return {
      success: true,
      message: "Cargo deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar cargo: ${error.message}`, { error });
    } else {
      logger.error("Erro desconhecido ao deletar cargo", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar o cargo.",
    };
  }
}
