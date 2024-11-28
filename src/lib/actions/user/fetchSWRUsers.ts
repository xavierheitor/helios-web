"use server";

import { logger } from "@/lib/common/logger";
import { User } from "@prisma/client";
import prisma from "@/lib/common/prisma";
import { SWRError } from "@/lib/common/errors/SWRError";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";

export async function fetchSWRUsers(): Promise<Partial<User>[]> {
  logger.info("fetchUsers action called!");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.usuarios_list,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(`Permissao negada: ${permissionCheck.message}`);
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${users.length} usuários`
    );

    return users;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar usuários: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar usuários", { error });
      throw new SWRError("Erro desconhecido ao buscar usuários");
    }
  }
}
