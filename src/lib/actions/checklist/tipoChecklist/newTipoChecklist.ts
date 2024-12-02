"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { ChecklistTypeFormSchema } from "@/lib/utils/formSchemas/tipoChecklistFormSchema";

export async function newTipoChecklist(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(`newTipoChecklist action called. data: ${formData}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_tipo,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = ChecklistTypeFormSchema.safeParse({
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
    const tipoChecklist = await prisma.checklistType.create({
      data: {
        name,
        description,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Tipo de checklist ${tipoChecklist.id} criado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Tipo de checklist criado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar tipo de checklist: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar tipo de checklist", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar tipo de checklist",
      };
    }
  }
}
