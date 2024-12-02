"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { QuestionFormSchema } from "@/lib/utils/formSchemas/questionFormSchema";

export async function editPergunta(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(`editPergunta action called. data: ${JSON.stringify(formData)}`);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_pergunta,
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
    logger.error(`ID da pergunta inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID da pergunta inválido",
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
    };
  }

  const { text, checklistTypeId } = validatedFields.data;

  try {
    const pergunta = await prisma.question.findFirst({ where: { id } });

    if (!pergunta) {
      logger.error(`Pergunta ${id} não encontrada`);
      return {
        success: false,
        message: "Pergunta não encontrada",
      };
    }

    await prisma.question.update({
      where: { id },
      data: {
        text,
        checklistTypeId,
      },
    });

    logger.info(
      `Pergunta ${id} editada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Pergunta editada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar pergunta: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar pergunta", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar pergunta",
      };
    }
  }
}
