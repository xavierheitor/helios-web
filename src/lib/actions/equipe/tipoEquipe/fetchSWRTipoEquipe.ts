"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { TeamType } from "@prisma/client";

export async function fetchSWRTipoEquipe(): Promise<TeamType[]> {
  logger.info("fetchSWRTipoEquipe action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoEquipe,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const tipoEquipes = await prisma.teamType.findMany();

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${tipoEquipes.length} tipos de equipe`
    );

    return tipoEquipes;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar tipos de equipe: ${error.message}`, {
        error,
      });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar tipos de equipe", { error });
      throw new SWRError("Erro desconhecido ao buscar tipos de equipe");
    }
  }
}
