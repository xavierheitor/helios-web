// src/lib/actions/device/deleteDevice.ts
"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ActionResult } from "../../../../types/actions/action-result";

export async function deleteDevice(id: number): Promise<ActionResult> {
  logger.info(`deleteDevice action called for id ${id}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_dispositivo,
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
    const device = await prisma.device.findUnique({ where: { id } });

    if (!device) {
      logger.error(`Dispositivo ${id} não encontrado`);
      return {
        success: false,
        message: "Dispositivo não encontrado",
      };
    }

    await prisma.softDelete("device", { id });

    logger.info(
      `Dispositivo ${id} deletado com sucesso pelo usuário: ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Dispositivo deletado com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao deletar dispositivo: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao deletar dispositivo", { error });
      return {
        success: false,
        message: "Erro desconhecido ao deletar dispositivo",
      };
    }
  }
}
