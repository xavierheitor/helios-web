// src/lib/actions/device/editDevice.ts
"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { DeviceFormSchema } from "@/lib/utils/formSchemas/deviceFormSchema";

import crypto from "crypto";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";

export async function editDevice(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editDevice action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_dispositivo,
    PERMISSIONS.EDIT
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const id = parseInt(formData.get("id")?.toString() || "0");
  if (isNaN(id) || id <= 0) {
    logger.error(`ID do dispositivo inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID do dispositivo inválido",
    };
  }

  const contractIds = JSON.parse(
    formData.get("contractIds") as string
  ) as number[];

  const validatedFields = DeviceFormSchema.safeParse({
    id,
    name: formData.get("name"),
    deviceUniqueId: formData.get("deviceUniqueId"),
    contractIds: contractIds,
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { name, deviceUniqueId } = validatedFields.data;

  try {
    // Gerar novo deviceKey se o deviceUniqueId for alterado
    const device = await prisma.device.findUnique({ where: { id } });
    if (!device) {
      logger.error(`Dispositivo ${id} não encontrado`);
      return {
        success: false,
        message: "Dispositivo não encontrado",
      };
    }

    let deviceKey = device.deviceKey;
    if (device.deviceUniqueId !== deviceUniqueId) {
      const privateKey = process.env.DEVICE_PRIVATE_KEY || "private_key";
      deviceKey = crypto
        .createHmac("sha256", privateKey)
        .update(deviceUniqueId)
        .digest("hex");
    }

    // Atualizar dispositivo
    await prisma.device.update({
      where: { id },
      data: {
        name,
        deviceUniqueId,
        deviceKey,
      },
    });

    // Atualizar permissões
    // Remover permissões existentes
    await prisma.deviceContractPermissions.deleteMany({
      where: { deviceId: id },
    });

    // Adicionar novas permissões
    if (contractIds && contractIds.length > 0) {
      const permissionsData = contractIds.map((contractId) => ({
        deviceId: id,
        contractId,
        createdByUser: permissionCheck.userId,
      }));
      await prisma.deviceContractPermissions.createMany({
        data: permissionsData,
      });
    }

    logger.info(
      `Dispositivo ${id} atualizado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Dispositivo atualizado com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao atualizar dispositivo: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: `Erro ao atualizar dispositivo: ${error.message}`,
      };
    } else {
      logger.error("Erro desconhecido ao atualizar dispositivo", { error });
      return {
        success: false,
        message: "Erro desconhecido ao atualizar dispositivo",
      };
    }
  }
}
