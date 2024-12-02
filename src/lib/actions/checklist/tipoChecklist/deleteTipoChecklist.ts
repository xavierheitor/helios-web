"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";

export async function deleteTipoChecklist(id: number): Promise<ActionResult> {
  logger.info(`deleteTipoChecklist action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_tipo,
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
    const tipoChecklist = await prisma.checklistType.findUnique({
      where: { id },
    });

    if (!tipoChecklist) {
      logger.error(`Tipo de checklist ${id} não encontrado`);
      return {
        success: false,
        message: "Tipo de checklist não encontrado",
      };
    }

    await prisma.softDelete("checklistType", { id });

    logger.info(
      `Tipo de checklist ${id} deletado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Tipo de checklist deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar tipo de checklist: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar tipo de checklist", { error });
      return {
        success: false,
        message: "Erro desconhecido ao deletar tipo de checklist",
      };
    }
  }
}
