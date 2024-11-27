"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { ActionResult } from "../../../../../types/actions/action-result";
import { verifySession } from "@/lib/server/session";

export async function deleteUserContractPermission(
  id: number
): Promise<ActionResult> {
  logger.info(`deleteUser action called for id ${id}`);

  // **Verificação de Autenticação**
  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  try {
    const userContractPermission =
      await prisma.userContractPermission.findUnique({ where: { id } });

    if (!userContractPermission) {
      logger.error(`Permissão de contrato ${id} não encontrada`);
      return {
        success: false,
        message: "Permissão de contrato não encontrada",
      };
    }

    await prisma.userContractPermission.delete({ where: { id } });

    logger.info(
      `Permissão de contrato ${id} deletada pelo usuário ${session.userId}`
    );

    return {
      success: true,
      message: "Permissão de contrato deletada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(
        `Erro ao deletar permissao de contrato do usuario: ${error.message}`,
        { error }
      );
    } else {
      logger.error(
        "Erro desconhecido ao deletar permissao de contrato do usuario:",
        { error }
      );
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar permissao de contrato do usuario.",
    };
  }
}
