"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../../types/actions/form-state";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ActionResult } from "next/dist/server/app-render/types";
import { VehicleTypeFormSchema } from "@/lib/utils/formSchemas/vehicleTypeFormSchema";

export async function editTipoVeiculo(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editTipoVeiculo action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoVeiculo,
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
    logger.error(`ID do Tipo de Veículo inválido: ${formData.get("id")}`);
    throw new SWRError("ID inválido");
  }

  const validatedFields = VehicleTypeFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { name, description } = validatedFields.data;

  try {
    const vehicleType = await prisma.vehicleType.findFirst({
      where: {
        id: id,
      },
    });

    if (!vehicleType) {
      logger.error(`Tipo de Veículo não encontrado: ${id}`);
      throw new SWRError("Tipo de Veículo não encontrado");
    }

    const updatedVehicleType = await prisma.vehicleType.update({
      where: {
        id: id,
      },
      data: {
        name,
        description,
      },
    });

    logger.info(
      `Tipo de Veículo editado: ${updatedVehicleType.id} pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Tipo de Veículo editado com sucesso",
      data: updatedVehicleType,
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar tipo de veiculo: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar tipo de veiculo", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar tipo de veiculo",
      };
    }
  }
}
