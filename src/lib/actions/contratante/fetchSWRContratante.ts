"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { verifySession } from "@/lib/server/session";
import { Contractor } from "@prisma/client";

export async function fetchSWRContratante(id: string): Promise<Contractor> {
  logger.info(`fetchSWRContratante action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contratante,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(`Usuário sem permissao para realizar esta atividade`);
  }

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    logger.error(`ID do contratante inválido: ${id}`);
    throw new SWRError(`ID do contratante inválido: ${id}`);
  }

  try {
    const contratante = await prisma.contractor.findFirst({
      where: {
        id: parsedId,
      },
    });

    if (!contratante) {
      logger.error(
        `Usuário ${permissionCheck?.userId} tentou buscar um contratante inexistente`
      );
      throw new SWRError("Contratante não encontrado");
    }

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou o contratante id ${id}`
    );

    return contratante;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar contratante: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar contratante", { error });
      throw new SWRError("Erro desconhecido ao buscar contratante");
    }
  }
}
