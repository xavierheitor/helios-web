// src/lib/actions/checklist/editChecklist.ts
"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { ChecklistFormSchema } from "@/lib/utils/formSchemas/checklistFormSchema";
import { ChecklistMobileType } from "@prisma/client";

export async function editChecklist(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(
    `editChecklist action called. data: ${JSON.stringify(
      Object.fromEntries(formData)
    )}`
  );

  // Verificação de Permissões
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist,
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
    logger.error(`ID do checklist inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID do checklist inválido",
    };
  }

  const questionsIds = JSON.parse(
    formData.get("questionsIds") as string
  ) as number[];

  const validatedFields = ChecklistFormSchema.safeParse({
    id,
    name: formData.get("name"),
    description: formData.get("description"),
    checklistTypeId: formData.get("checklistTypeId"),
    checklistMobileType: formData.get(
      "checklistMobileType"
    ) as ChecklistMobileType,

    questionsIds,
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { name, description, checklistTypeId } = validatedFields.data;

  try {
    await prisma.checklist.update({
      where: { id },
      data: {
        name,
        description,
        checklistTypeId,
        checklistMobileType: formData.get(
          "checklistMobileType"
        ) as ChecklistMobileType,
        updatedAt: new Date(),
      },
    });

    // Atualizar associações de perguntas
    await prisma.checklistAssociatedQuestion.deleteMany({
      where: { checklistId: id },
    });

    if (questionsIds && questionsIds.length > 0) {
      const associations = questionsIds.map((questionId) => ({
        checklistId: id,
        questionId,
        createdByUser: permissionCheck.userId,
      }));
      await prisma.checklistAssociatedQuestion.createMany({
        data: associations,
      });
    }

    logger.info(
      `Checklist ${id} atualizado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Checklist atualizado com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao atualizar checklist: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao atualizar checklist", {
        error,
      });
      return {
        success: false,
        message: "Erro desconhecido ao atualizar checklist",
      };
    }
  }
}
