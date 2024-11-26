"use server";

import { logger } from "@/lib/common/logger";
import { verifySession } from "@/lib/server/session";
import { User } from "@prisma/client";
import prisma from "@/lib/common/prisma";
import { SWRError } from "@/lib/common/errors/SWRError";

export async function fetchSWRUsers(): Promise<Partial<User>[]> {
  logger.info("fetchUsers action called!");

  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    throw new SWRError("Usuário não autenticado");
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
      },
    });

    logger.info(`Usuário ${session?.userId} buscou ${users.length} usuários`);

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
