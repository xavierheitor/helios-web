"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";

export async function deleteContract(id: number): Promise<ActionResult> {
  logger.info(`deleteContract action called for id ${id}`);

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
    const contract = await prisma.contract.findUnique({ where: { id } });

    if (!contract) {
      logger.error(`Contrato ${id} não encontrado`);
      return {
        success: false,
        message: "Contrato não encontrado",
      };
    }

    await prisma.softDelete("contract", { id });

    logger.info(`Contrato ${id} deletado com sucesso`);
    return {
      success: true,
      message: "Contrato deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar contrato: ${error.message}`, { error });
    } else {
      logger.error("Erro desconhecido ao deletar contrato", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar o contrato.",
    };
  }
}
