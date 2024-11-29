"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";

import { verifySession } from "@/lib/server/session";
import { Contractor } from "@prisma/client";

export async function fetchSWRContratantes(): Promise<Contractor[]> {
  logger.info("fetchSWRContratantes action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contratante,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(`Usuário sem permissao para realizar esta atividade`);
  }

  try {
    const contratantes = await prisma?.contractor.findMany();

    logger.info(
      `Usuário ${permissionCheck.userId} buscou ${contratantes.length} contratantes`
    );

    return contratantes;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar contratantes: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar contratantes", { error });
      throw new SWRError("Erro desconhecido ao buscar contratantes");
    }
  }
}
2;
