"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { z } from "zod";
import { FormState } from "../../../../../../types/actions/form-state";
import { ActionResult } from "next/dist/server/app-render/types";

// **Schema de Validação com Zod**
const ChecklistVehicleTypeAssociationSchema = z.object({
  checklistId: z.number().positive(),
  vehicleTypeId: z.number().positive(),
});

export async function newChecklistVehicleTypeAssociation(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newChecklistVehicleTypeAssociation action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_associacao,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = ChecklistVehicleTypeAssociationSchema.safeParse({
    checklistId: parseInt(formData.get("checklistId")?.toString() || "0"),
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

  const { checklistId, vehicleTypeId } = validatedFields.data;

  try {
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

    const association = await prisma.checklistVehicleTypeAssociation.create({
      data: {
        checklistId,
        vehicleTypeId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Associação criada com sucesso para o tipo de veículo ${association.vehicleTypeId} pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Associação de tipo de veículo criada com sucesso.",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(
        `Erro ao criar associação de tipo de veículo: ${error.message}`,
        { error }
      );
      return {
        success: false,
        message: `Erro ao criar associação de tipo de veículo: ${error.message}`,
      };
    } else {
      logger.error("Erro desconhecido ao criar associação de tipo de veículo", {
        error,
      });
      return {
        success: false,
        message: "Erro desconhecido ao criar associação de tipo de veículo.",
      };
    }
  }
}
