// src/lib/actions/checklist/fetchSWRChecklists.ts
"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";
import { MenuKeys } from "@/enums/menus";
import { SWRError } from "@/lib/common/errors/SWRError";
import { ChecklistWithRelations } from "@/lib/utils/prismaTypes/checklistWithRelations";

export async function fetchSWRChecklists(): Promise<
  ChecklistWithRelations[]
> {
  logger.info("fetchSWRChecklists action called");

  // Verificação de Permissões
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const checklists = await prisma.checklist.findMany({
      include: {
        checklistType: true,
        associatedQuestions: {
          include: {
            question: true,
          },
        },
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${checklists.length} checklists`
    );

    return checklists;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao buscar checklists: ${error.message}`, {
        error,
      });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar checklists", {
        error,
      });
      throw new SWRError("Erro desconhecido ao buscar checklists");
    }
  }
}