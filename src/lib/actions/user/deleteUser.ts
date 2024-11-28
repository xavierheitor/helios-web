"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../types/actions/action-result";
import { verifySession } from "@/lib/server/session";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";
import { MenuKeys } from "@/enums/menus";

export async function deleteUser(id: number): Promise<ActionResult> {
  logger.info(`deleteUser action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.usuarios_list,
    PERMISSIONS.DELETE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      logger.error(`User ${id} não encontrado`);
      return {
        success: false,
        message: "Usuário não encontrado",
      };
    }

    // **Remover Permissões de Contratos Associadas**
    await prisma.userContractPermission.deleteMany({
      where: { userId: id },
    });

    await prisma.softDelete("user", { id });

    logger.info(
      `User ${id} deletado logicamente pelo usuário ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Usuário deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar user: ${error.message}`, { error });
    } else {
      logger.error("Erro desconhecido ao deletar user", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar o usuário.",
    };
  }
}
