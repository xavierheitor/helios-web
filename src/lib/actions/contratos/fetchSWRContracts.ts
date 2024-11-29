"use server";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";

import { verifySession } from "@/lib/server/session";
import { Contract } from "@prisma/client";

export default async function fetchSWRContratos(): Promise<Contract[]> {
  logger.info("fetchSWRContratos action called!");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contrato,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const contracts = await prisma.contract.findMany();

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou  ${contracts.length} contratos`
    );

    return contracts;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar contratos: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar usuario", { error });
      throw new SWRError("Erro desconhecido ao buscar usuario");
    }
  }
}
