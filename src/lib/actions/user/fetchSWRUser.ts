"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { SWRError } from "@/lib/common/errors/SWRError";
import { User } from "@prisma/client";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";

export async function fetchSWRUser(userId: string): Promise<Partial<User>> {
  logger.info(`fetchUser action called for userId ${userId}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.usuarios_list,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(`Permissao negada: ${permissionCheck.message}`);
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId) || parsedUserId <= 0) {
    logger.error(`ID do User inválido: ${userId}`);
    throw new SWRError(`ID do User inválido: ${userId}`);
  }

  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
      },
      where: {
        id: parsedUserId,
      },
    });

    if (!user) {
      logger.error(
        `Usuário ${permissionCheck?.userId} tentou buscar um usuário inexistente`
      );
      throw new SWRError("Usuário não encontrado");
    }

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou o usuário id ${userId}`
    );

    return user;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar usuario: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar usuario", { error });
      throw new SWRError("Erro desconhecido ao buscar usuario");
    }
  }
}
