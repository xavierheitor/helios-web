"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { QuestionWithRelations } from "@/lib/utils/prismaTypes/questionWithRelations";

export async function fetchSWRPerguntas(): Promise<QuestionWithRelations[]> {
  logger.info("fetchSWRPerguntas action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_pergunta,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const perguntas = await prisma.question.findMany({
      include: {
        checklistType: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${perguntas.length} perguntas`
    );

    return perguntas;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar perguntas: ${error.message}`, {
        error,
      });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar perguntas", { error });
      throw new SWRError("Erro desconhecido ao buscar perguntas");
    }
  }
}
