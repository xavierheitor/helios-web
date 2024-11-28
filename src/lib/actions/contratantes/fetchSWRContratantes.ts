"use server";

import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { verifySession } from "@/lib/server/session";
import { Contractor } from "@prisma/client";

export async function fetchSWRContratantes(): Promise<Contractor[]> {
  logger.info("fetchSWRContratantes action called");

  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    throw new SWRError("Usuário não autenticado");
  }

  try {
    const contratantes = await prisma?.contractor.findMany();

    logger.info(
      `Usuário ${session.userId} buscou ${contratantes.length} contratantes`
    );

    return contratantes;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar contratantes: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar contratantes", { error });
      throw new SWRError("Erro desconhecido ao buscar contratantes");
    }
  }
}
2