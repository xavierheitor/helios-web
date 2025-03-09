// src/lib/actions/checklist/newChecklist.ts
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

export async function newChecklist(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(
    `newChecklist action called. data: ${JSON.stringify(
      Object.fromEntries(formData)
    )}`
  );

  // Verificação de Permissões
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const questionsIds = JSON.parse(
    formData.get("questionsIds") as string
  ) as number[];

  const validatedFields = ChecklistFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    checklistTypeId: formData.get("checklistTypeId"),
    ChecklistMobileType: formData.get("checklistMobileType") as ChecklistMobileType,
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
    const checklist = await prisma.checklist.create({
      data: {
        name,
        description,
        checklistTypeId,
        checklistMobileType: formData.get("checklistMobileType") as ChecklistMobileType,
        createdByUser: permissionCheck.userId,
      },
    });

    // Associar perguntas
    if (questionsIds && questionsIds.length > 0) {
      const associations = questionsIds.map((questionId) => ({
        checklistId: checklist.id,
        questionId,
        createdByUser: permissionCheck.userId,
      }));
      await prisma.checklistAssociatedQuestion.createMany({
        data: associations,
      });
    }

    logger.info(
      `Checklist ${checklist.id} criado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Checklist criado com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao criar checklist: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar checklist", {
        error,
      });
      return {
        success: false,
        message: "Erro desconhecido ao criar checklist",
      };
    }
  }
}
