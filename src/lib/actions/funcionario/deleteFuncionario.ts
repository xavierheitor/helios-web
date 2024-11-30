"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";

export async function deleteFuncionario(id: number): Promise<ActionResult> {
  logger.info(`deleteFuncionario action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_funcionario,
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
    const funcionario = await prisma.employee.findUnique({ where: { id } });

    if (!funcionario) {
      logger.error(`Funcionario ${id} não encontrado`);
      return {
        success: false,
        message: "Funcionario não encontrado",
      };
    }

    await prisma.softDelete("employee", { id });

    logger.info(`Funcionario ${id} deletado com sucesso`);
    return {
      success: true,
      message: "Funcionario deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar funcionario: ${error.message}`, { error });
    } else {
      logger.error("Erro desconhecido ao deletar funcionario", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar o funcionario.",
    };
  }
}
