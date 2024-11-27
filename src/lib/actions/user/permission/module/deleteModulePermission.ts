"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { ActionResult } from "../../../../../../types/actions/action-result";
import { verifySession } from "@/lib/server/session";

/**
 * Deleta uma permissão de módulo do usuário.
 * @param id - ID da permissão a ser deletada.
 * @returns Resultado da ação contendo sucesso e mensagem.
 */
export async function deleteUserModulePermission(
  id: number
): Promise<ActionResult> {
  logger.info(`deleteUserModulePermission action called for id ${id}`);

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
    const userModulePermission = await prisma.userModulePermission.findUnique({
      where: { id },
    });

    if (!userModulePermission) {
      logger.error(`Permissão de módulo ${id} não encontrada`);
      return {
        success: false,
        message: "Permissão de módulo não encontrada",
      };
    }

    await prisma.userModulePermission.delete({ where: { id } });

    logger.info(
      `Permissão de módulo ${id} deletada pelo usuário ${session.userId}`
    );

    return {
      success: true,
      message: "Permissão de módulo deletada com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `Erro ao deletar permissão de módulo do usuário: ${error.message}`,
        { error }
      );
    } else {
      logger.error(
        "Erro desconhecido ao deletar permissão de módulo do usuário",
        { error }
      );
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar a permissão de módulo.",
    };
  }
}
