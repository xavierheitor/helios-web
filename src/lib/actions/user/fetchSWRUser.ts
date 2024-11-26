"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { verifySession } from "@/lib/server/session";
import { SWRError } from "@/lib/common/errors/SWRError";
import { User } from "@prisma/client";

export async function fetchSWRUser(userId: string): Promise<Partial<User>> {
  logger.info(`fetchUser action called for userId ${userId}`);

  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    throw new SWRError("Usuário não autenticado");
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
        `Usuário ${session?.userId} tentou buscar um usuário inexistente`
      );
      throw new SWRError("Usuário não encontrado");
    }

    logger.info(`Usuário ${session?.userId} buscou o usuário id ${userId}`);

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
