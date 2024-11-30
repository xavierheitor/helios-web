"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../types/actions/action-result";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";

export async function deleteVeiculo(id: number): Promise<ActionResult> {
  logger.info(`deleteVeiculo action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_veiculo,
    PERMISSIONS.DELETE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const veiculo = await prisma.vehicle.findUnique({ where: { id } });

    if (!veiculo) {
      logger.error(`Veiculo ${id} não encontrado`);
      throw new SWRError("Veiculo não encontrado");
    }

    await prisma.softDelete("vehicle", { id });

    logger.info(`Veiculo ${id} deletado com sucesso`);
    return {
      success: true,
      message: "Veiculo deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar veiculo: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao deletar veiculo", { error });
      throw new SWRError("Ocorreu um erro ao deletar o veiculo.");
    }
  }
}
