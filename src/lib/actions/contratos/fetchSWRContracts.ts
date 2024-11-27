"use server";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { verifySession } from "@/lib/server/session";
import { Contract } from "@prisma/client";

export default async function fetchSWRContratos(): Promise<Contract[]> {
  logger.info("fetchSWRContratos action called!");

  // **Verificação de Autenticação**
  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    throw new SWRError("Usuário não autenticado");
  }

  try {
    const contracts = await prisma.contract.findMany();

    logger.info(
      `Usuário ${session?.userId} buscou  ${contracts.length} contratos`
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
