"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { AnswerWithRelations } from "@/lib/utils/prismaTypes/answerWithRelations";

export async function fetchSWRRespostas(): Promise<AnswerWithRelations[]> {
  logger.info("fetchSWRRespostas action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_opcaoResposta,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const respostas = await prisma.answer.findMany({
      include: {
        checklistType: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${respostas.length} respostas`
    );

    return respostas;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar respostas: ${error.message}`, {
        error,
      });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar respostas", { error });
      throw new SWRError("Erro desconhecido ao buscar respostas");
    }
  }
}
