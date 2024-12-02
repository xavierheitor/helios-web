"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { MenuKeys } from "@/enums/menus";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";

export async function deleteResposta(id: number): Promise<ActionResult> {
  logger.info(`deleteResposta action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_opcaoResposta,
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
    const resposta = await prisma.answer.findUnique({ where: { id } });

    if (!resposta) {
      logger.error(`Resposta ${id} não encontrada`);
      return {
        success: false,
        message: "Resposta não encontrada",
      };
    }

    await prisma.softDelete("answer", { id });

    logger.info(
      `Resposta ${id} deletada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Resposta deletada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar resposta: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar resposta", { error });
      return {
        success: false,
        message: "Erro desconhecido ao deletar resposta",
      };
    }
  }
}
