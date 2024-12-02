"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ActionResult } from "../../../../types/actions/action-result";
import { FormState } from "../../../../types/actions/form-state";
import { VehicleFormSchema } from "@/lib/utils/formSchemas/vehicleFormSchema";

export async function newVeiculo(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newVeiculo action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_veiculo,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = VehicleFormSchema.safeParse({
    plate: formData.get("plate"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year"),
    color: formData.get("color"),
    operationalNumber: formData.get("operationalNumber"),
    contractId: formData.get("contractId"),
    vehicleTypeId: formData.get("vehicleTypeId"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const {
    plate,
    brand,
    model,
    year,
    color,
    operationalNumber,
    contractId,
    vehicleTypeId,
  } = validatedFields.data;

  try {
    const veiculo = await prisma.vehicle.create({
      data: {
        plate,
        brand,
        model,
        year,
        color,
        operationalNumber,
        contractId,
        vechicleTypeId: vehicleTypeId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Veículo ${veiculo.plate} criado com sucesso pelo usuário ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Veículo criado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar veículo: ${error.message}`, { error });
      return {
        success: false,
        message: `Erro ao criar veículo: ${error.message}`,
      };
    } else {
      logger.error("Erro desconhecido ao criar veículo", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar veículo",
      };
    }
  }
}
