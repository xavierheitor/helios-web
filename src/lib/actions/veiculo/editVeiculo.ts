"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { VehicleFormSchema } from "@/lib/utils/formSchemas/vehicleFormSchema";

export async function editVeiculo(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editVeiculo action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_veiculo,
    PERMISSIONS.EDIT
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  const id = parseInt(formData.get("id")?.toString() || "0");
  if (isNaN(id) || id <= 0) {
    logger.error(`ID do veículo inválido: ${formData.get("id")}`);
    throw new SWRError("ID inválido");
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
    const veiculo = await prisma.vehicle.findFirst({
      where: {
        id: id,
      },
    });

    if (!veiculo) {
      logger.error(`Veículo não encontrado: ${id}`);
      throw new SWRError("Veículo não encontrado");
    }

    const updatedVeiculo = await prisma.vehicle.update({
      where: {
        id: id,
      },
      data: {
        plate,
        brand,
        model,
        year,
        color,
        operationalNumber,
        contractId,
        vechicleTypeId: vehicleTypeId,
      },
    });

    logger.info(
      `Veículo ${updatedVeiculo.plate} atualizado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Veículo atualizado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao atualizar veículo: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao atualizar veículo", { error });
      throw new SWRError("Erro desconhecido ao atualizar veículo");
    }
  }
}
