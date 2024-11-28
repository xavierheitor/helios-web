"use server";

import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { verifySession } from "@/lib/server/session";
import { Contractor } from "@prisma/client";

export async function fetchSWRContratante(id: string): Promise<Contractor> {
  logger.info(`fetchSWRContratante action called for id ${id}`);

  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    throw new SWRError("Usuário não autenticado");
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
        `Usuário ${session?.userId} tentou buscar um contratante inexistente`
      );
      throw new SWRError("Contratante não encontrado");
    }

    logger.info(`Usuário ${session?.userId} buscou o contratante id ${id}`);

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
