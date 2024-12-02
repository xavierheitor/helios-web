// src/lib/actions/checklist/resposta/editResposta.ts
"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { AnswerFormSchema } from "@/lib/utils/formSchemas/answerFormSchema";

export async function editResposta(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(
    `editResposta action called. data: ${JSON.stringify(
      Object.fromEntries(formData)
    )}`
  );

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_opcaoResposta,
    PERMISSIONS.EDIT
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = AnswerFormSchema.safeParse({
    id: formData.get("id"),
    text: formData.get("text"),
    checklistTypeId: formData.get("checklistTypeId"),
    pending: formData.get("pending"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
      message: "Campos do formulário inválidos",
    };
  }

  const { id, text, pending, checklistTypeId } = validatedFields.data;

  try {
    const resposta = await prisma.answer.update({
      where: { id },
      data: {
        text,
        pending,
        checklistTypeId,
      },
    });

    logger.info(
      `Resposta ${resposta.id} editada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Resposta editada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar resposta: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar resposta", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar resposta",
      };
    }
  }
}
