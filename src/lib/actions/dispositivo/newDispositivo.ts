// src/lib/actions/device/newDevice.ts
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

export async function newDevice(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newDevice action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_dispositivo,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const contractIds = JSON.parse(formData.get("contractIds") as string) as number[];

  const validatedFields = DeviceFormSchema.safeParse({
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
    // Gerar deviceKey a partir do deviceUniqueId e chave privada
    const privateKey = process.env.DEVICE_PRIVATE_KEY || "private_key";
    const deviceKey = crypto
      .createHmac("sha256", privateKey)
      .update(deviceUniqueId)
      .digest("hex");

    // Criar dispositivo
    const device = await prisma.device.create({
      data: {
        name,
        deviceUniqueId,
        deviceKey,
        createdByUser: permissionCheck.userId,
      },
    });

    // Criar permissões
    if (contractIds && contractIds.length > 0) {
      const permissionsData = contractIds.map((contractId) => ({
        deviceId: device.id,
        contractId,
        createdByUser: permissionCheck.userId,
      }));
      await prisma.deviceContractPermissions.createMany({
        data: permissionsData,
      });
    }

    logger.info(
      `Dispositivo ${device.id} criado com sucesso pelo usuário ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Dispositivo criado com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao criar dispositivo: ${error.message}`, { error });
      return {
        success: false,
        message: `Erro ao criar dispositivo: ${error.message}`,
      };
    } else {
      logger.error("Erro desconhecido ao criar dispositivo", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar dispositivo",
      };
    }
  }
}