"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { Role } from "@prisma/client";

export async function fetchSWRCargos(): Promise<Role[]> {
  logger.info("fetchSWRCargos action called!");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_cargo,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const roles = await prisma.role.findMany();

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${roles.length} cargos`
    );

    return roles;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar cargos: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar cargos", { error });
      throw new SWRError("Erro desconhecido ao buscar cargos");
    }
  }
}
