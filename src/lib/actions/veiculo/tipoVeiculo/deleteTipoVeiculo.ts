"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { ActionResult } from "../../../../../types/actions/action-result";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";

export async function deleteTipoVeiculo(id: number): Promise<ActionResult> {
  logger.info(`deleteTipoVeiculo action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoVeiculo,
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
    const tipoVeiculo = await prisma.vehicleType.findUnique({ where: { id } });

    if (!tipoVeiculo) {
      logger.error(`Tipo de veiculo ${id} não encontrado`);
      return {
        success: false,
        message: "Tipo de veiculo não encontrado",
      };
    }

    await prisma.softDelete("vehicleType", { id });

    logger.info(`Tipo de veiculo ${id} deletado com sucesso`);
    return {
      success: true,
      message: "Tipo de veiculo deletado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao deletar tipo de veiculo: ${error.message}`, {
        error,
      });
    } else {
      logger.error("Erro desconhecido ao deletar tipo de veiculo", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao deletar o tipo de veiculo.",
    };
  }
}
