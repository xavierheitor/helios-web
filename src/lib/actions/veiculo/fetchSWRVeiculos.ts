"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { VehicleWithRelations } from "@/lib/utils/prismaTypes/vehicleWithRelations";

export async function fetchSWRVeiculos(): Promise<VehicleWithRelations[]> {
  logger.info("fetchSWRVeiculos action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_veiculo,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const veiculos = await prisma.vehicle.findMany({
      include: {
        contract: true,
        vehicleType: true,
      },
      where: {
        contractId: {
          in: permissionCheck.allowedContractsId,
        },
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${veiculos.length} veículos`
    );

    return veiculos;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar veículos: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar veículos", { error });
      throw new SWRError("Erro desconhecido ao buscar veículos");
    }
  }
}
