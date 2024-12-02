"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { SWRError } from "@/lib/common/errors/SWRError";
import { QuestionFormSchema } from "@/lib/utils/formSchemas/questionFormSchema";

export async function newPergunta(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(`newPergunta action called. data: ${JSON.stringify(formData)}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_pergunta,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = QuestionFormSchema.safeParse({
    text: formData.get("text"),
    checklistTypeId: formData.get("checklistTypeId"),
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

  const { text, checklistTypeId } = validatedFields.data;

  try {
    const pergunta = await prisma.question.create({
      data: {
        text,
        checklistTypeId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Pergunta ${pergunta.id} criada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Pergunta criada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar pergunta: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar pergunta", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar pergunta",
      };
    }
  }
}
