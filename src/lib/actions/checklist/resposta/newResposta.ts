// src/lib/actions/checklist/resposta/newResposta.ts
"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { AnswerFormSchema } from "@/lib/utils/formSchemas/answerFormSchema";

export async function newResposta(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(
    `newResposta action called. data: ${JSON.stringify(
      Object.fromEntries(formData)
    )}`
  );

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_opcaoResposta,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = AnswerFormSchema.safeParse({
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

  const { text, pending, checklistTypeId } = validatedFields.data;

  try {
    const resposta = await prisma.answer.create({
      data: {
        text,
        pending,
        checklistTypeId: checklistTypeId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Resposta ${resposta.id} criada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Resposta criada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar resposta: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar resposta", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar resposta",
      };
    }
  }
}