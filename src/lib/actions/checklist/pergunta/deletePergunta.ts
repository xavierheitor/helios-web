"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { MenuKeys } from "@/enums/menus";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";

export async function deletePergunta(id: number): Promise<ActionResult> {
  logger.info(`deletePergunta action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_pergunta,
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
    const pergunta = await prisma.question.findUnique({ where: { id } });

    if (!pergunta) {
      logger.error(`Pergunta ${id} não encontrada`);
      return {
        success: false,
        message: "Pergunta não encontrada",
      };
    }

    await prisma.softDelete("answer", { id });

    logger.info(
      `Pergunta ${id} deletada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Pergunta deletada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar pergunta: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar pergunta", { error });
      return {
        success: false,
        message: "Erro desconhecido ao deletar pergunta",
      };
    }
  }
}
