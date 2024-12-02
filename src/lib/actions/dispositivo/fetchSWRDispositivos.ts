"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";
import { MenuKeys } from "@/enums/menus";
import { SWRError } from "@/lib/common/errors/SWRError";
import { DeviceWithPermissions } from "@/lib/utils/prismaTypes/deviceWithRelations";

export async function fetchSWRDispositivos(): Promise<DeviceWithPermissions[]> {
  logger.info("fetchSWRDispositivos action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_dispositivo,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const dispositivos = await prisma.device.findMany({
      include: {
        DeviceContractPermissions: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${dispositivos.length} dispositivos`
    );

    return dispositivos;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar dispositivos: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar dispositivos", { error });
      throw new SWRError("Erro desconhecido ao buscar dispositivos");
    }
  }
}
