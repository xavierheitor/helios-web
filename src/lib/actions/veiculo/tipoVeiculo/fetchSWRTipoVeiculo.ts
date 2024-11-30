"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { VehicleType } from "@prisma/client";

export async function fetchSWRTipoVeiculo(): Promise<VehicleType[]> {
  logger.info("fetchSWRTipoVeiculo action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoVeiculo,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const tipoVeiculo = await prisma.vehicleType.findMany();

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${tipoVeiculo.length} tipos de veículos`
    );

    return tipoVeiculo;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar tipos de veículos: ${error.message}`, {
        error,
      });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar tipos de veículos", { error });
      throw new SWRError("Erro desconhecido ao buscar tipos de veículos");
    }
  }
}
