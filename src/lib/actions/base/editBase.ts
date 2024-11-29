"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { BaseFormSchema } from "@/lib/utils/formSchemas/baseFormSchema";

export async function editBase(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editBase action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_base,
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
    logger.error(`ID da Base inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID inválido",
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
      message: "Erro na validação dos campos",
      errors,
    };
  }

  const { name, contractId } = validatedFields.data;

  try {
    const editedBase = await prisma.base.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        contractId: contractId,
      },
    });

    logger.info(`Base ${id} editada por ${permissionCheck.userId}`);

    return {
      success: true,
      message: "Base editada com sucesso",
      data: editedBase,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao editar base: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar base", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar base",
      };
    }
  }
}
