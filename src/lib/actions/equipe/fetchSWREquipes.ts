"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { TeamWithRelations } from "@/lib/utils/prismaTypes/teamWithRelations";

export async function fetchSWREquipes(): Promise<TeamWithRelations[]> {
  logger.info("fetchSWREquipes action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_equipe,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const equipes = await prisma.team.findMany({
      include: {
        teamType: true,
        contract: true,
      },
      where: {
        contractId: {
          in: permissionCheck.allowedContractsId,
        },
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${equipes.length} equipes`
    );

    return equipes;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar equipes: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar equipes", { error });
      throw new SWRError("Erro desconhecido ao buscar equipes");
    }
  }
}
