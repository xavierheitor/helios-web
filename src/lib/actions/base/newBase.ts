"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { BaseFormSchema } from "@/lib/utils/formSchemas/baseFormSchema";

export async function newBase(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newBase action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_base,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  // **Validação dos Campos do Formulário**

  const validatedFields = BaseFormSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    contractId: formData.get("contractId"),
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

  const { name, contractId } = validatedFields.data;

  try {
    const newBase = await prisma.base.create({
      data: {
        name: name,
        contractId: contractId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Base ${newBase.id} criada com sucesso pelo user ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Base criada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar base: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar base", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar base",
      };
    }
  }
}
