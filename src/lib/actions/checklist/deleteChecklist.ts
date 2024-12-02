// src/lib/actions/checklist/deleteChecklist.ts
"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ActionResult } from "../../../../types/actions/action-result";

export async function deleteChecklist(id: number): Promise<ActionResult> {
  logger.info(`deleteChecklist action called for id ${id}`);

  // Verificação de Permissões
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist,
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
    const checklist = await prisma.checklist.findUnique({ where: { id } });

    if (!checklist) {
      logger.error(`Checklist ${id} não encontrado`);
      return {
        success: false,
        message: "Checklist não encontrado",
      };
    }

    await prisma.softDelete("checklist", { id });

    logger.info(
      `Checklist ${id} deletado com sucesso pelo usuário: ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Checklist deletado com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao deletar checklist: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar checklist", {
        error,
      });
      return {
        success: false,
        message: "Erro desconhecido ao deletar checklist",
      };
    }
  }
}