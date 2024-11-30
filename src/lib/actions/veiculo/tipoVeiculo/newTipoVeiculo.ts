"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { VehicleTypeFormSchema } from "@/lib/utils/formSchemas/vehicleTypeFormSchema";

export async function newTipoVeiculo(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newTipoVeiculo action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoVeiculo,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
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
    const newTipoVeiculo = await prisma.vehicleType.create({
      data: {
        name,
        description,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Tipo de Veículo criado: ${newTipoVeiculo.id} pelo usuário ${formState.user?.email}`
    );

    return {
      success: true,
      data: newTipoVeiculo,
      message: "Tipo de Veículo criado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar tipo de veiculo: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar tipo de veiculo", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar tipo de veiculo",
      };
    }
  }
}
