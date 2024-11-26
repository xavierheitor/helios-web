"use server";

import { logger } from "@/lib/common/logger";
import { verifySession } from "@/lib/server/session";
import prisma from "@/lib/common/prisma";
import { SWRError } from "@/lib/common/errors/SWRError";
import { UserContractPermissionWithRelations } from "@/lib/utils/prismaTypes/userContractPermissionWithRelations";
import { extractIdFromKey } from "@/lib/utils/extractIdFromKey";

export async function fetchSWRContractPermissions(
  userId: string
): Promise<UserContractPermissionWithRelations[]> {
  logger.info(`fetchContractPermissions action called for userId ${userId}`);

  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    throw new SWRError("Usuário não autenticado");
  }

  const parsedUserId = extractIdFromKey("userContract-", userId);
  if (!parsedUserId) {
    logger.error(`ID do User inválido: ${userId}`);
    throw new SWRError(`ID do User inválido: ${userId}`);
  }

  try {
    const contractPermissions = await prisma.userContractPermission.findMany({
      where: {
        userId: parsedUserId,
      },
      include: {
        contract: true,
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
