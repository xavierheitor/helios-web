"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { BaseWithRelations } from "@/lib/utils/prismaTypes/baseWithRelations";

export async function fetchSWRBases(): Promise<BaseWithRelations[]> {
  logger.info("fetchSWRBases action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_base,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(`Usuário sem permissao para realizar esta atividade`);
  }

  try {
    const bases = await prisma.base.findMany({
      include: {
        contract: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck.userId} buscou ${bases.length} bases`
    );

    return bases;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar bases: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar bases", { error });
      throw new SWRError("Erro desconhecido ao buscar bases");
    }
  }
}
