"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ActionResult } from "next/dist/server/app-render/types";
import { z } from "zod";
import { FormState } from "../../../../../../types/actions/form-state";

// **Schema de Validação com Zod**
const EditChecklistVehicleTypeAssociationSchema = z.object({
  id: z.number().positive(),
  vehicleTypeId: z.number().positive(),
});

export async function editChecklistVehicleTypeAssociation(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editChecklistVehicleTypeAssociation action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_associacao,
    PERMISSIONS.EDIT
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = EditChecklistVehicleTypeAssociationSchema.safeParse({
    id: parseInt(formData.get("id")?.toString() || "0"),
    vehicleTypeId: parseInt(formData.get("vehicleTypeId")?.toString() || "0"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { id, vehicleTypeId } = validatedFields.data;

  try {
    const association = await prisma.checklistVehicleTypeAssociation.findUnique(
      {
        where: { id },
      }
    );

    if (!association) {
      logger.error(`Associação não encontrada: ID ${id}`);
      return {
        success: false,
        message: "Associação não encontrada.",
      };
    }

    if (association.vehicleTypeId !== vehicleTypeId) {
      // Verificar se a nova vehicleTypeId já está associada
      const existingAssociation =
        await prisma.checklistVehicleTypeAssociation.findUnique({
          where: { vehicleTypeId },
        });

      if (existingAssociation) {
        logger.error(
          `Associação já existe para o tipo de veículo ID: ${vehicleTypeId}`
        );
        return {
          success: false,
          message: "Esta associação de tipo de veículo já existe.",
        };
      }
    }

    const updatedAssociation =
      await prisma.checklistVehicleTypeAssociation.update({
        where: { id },
        data: {
          vehicleTypeId,
          createdByUser: permissionCheck.userId,
        },
      });

    logger.info(
      `Associação ID ${updatedAssociation.id} atualizada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Associação de tipo de veículo atualizada com sucesso.",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(
        `Erro ao editar associação de tipo de veículo: ${error.message}`,
        { error }
      );
      return {
        success: false,
        message: `Erro ao editar associação de tipo de veículo: ${error.message}`,
      };
    } else {
      logger.error(
        "Erro desconhecido ao editar associação de tipo de veículo",
        { error }
      );
      return {
        success: false,
        message: "Erro desconhecido ao editar associação de tipo de veículo.",
      };
    }
  }
}
