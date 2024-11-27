"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { verifySession } from "@/lib/server/session";
import { SWRError } from "@/lib/common/errors/SWRError";
import { extractIdFromKey } from "@/lib/utils/extractIdFromKey";
import { UserModulePermission } from "@prisma/client";

export async function fetchSWRModulePermissions(
  userId: string
): Promise<UserModulePermission[]> {
  logger.info(`fetchModulePermissions action called for userId ${userId}`);

  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    throw new SWRError("Usuário não autenticado");
  }

  const parsedUserId = extractIdFromKey("userModule-", userId);
  if (!parsedUserId) {
    logger.error(`ID do User inválido: ${userId}`);
    throw new SWRError(`ID do User inválido: ${userId}`);
  }

  try {
    const contractPermissions = await prisma.userModulePermission.findMany({
      where: {
        userId: parsedUserId,
      },
    });

    logger.info(
      `Usuário ${session?.userId} buscou as permissões de contrato do usuário id ${userId}`
    );

    return contractPermissions;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar permissões de contrato: ${error.message}`, {
        error,
      });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar permissões de contrato", {
        error,
      });
      throw new SWRError("Erro desconhecido ao buscar permissões de contrato");
    }
  }
}
