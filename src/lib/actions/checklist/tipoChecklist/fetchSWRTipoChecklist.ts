"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ChecklistType } from "@prisma/client";

export async function fetchSWRTipoChecklist(): Promise<ChecklistType[]> {
  logger.info("fetchSWRTipoChecklist action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_tipo,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const tipoChecklists = await prisma.checklistType.findMany();

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${tipoChecklists.length} tipos de checklist`
    );

    return tipoChecklists;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar tipos de checklist: ${error.message}`, {
        error,
      });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar tipos de checklist", { error });
      throw new SWRError("Erro desconhecido ao buscar tipos de checklist");
    }
  }
}
