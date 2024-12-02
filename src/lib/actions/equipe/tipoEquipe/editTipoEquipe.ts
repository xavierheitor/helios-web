"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { TeamTypeFormSchema } from "@/lib/utils/formSchemas/tipoEquipeFormSchema";

export async function editTipoEquipe(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editTipoEquipe action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoEquipe,
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
    logger.error(`ID do tipo de equipe inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID do tipo de equipe inválido",
    };
  }

  const validatedFields = TeamTypeFormSchema.safeParse({
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
    const tipoEquipe = await prisma.teamType.findFirst({ where: { id } });

    if (!tipoEquipe) {
      logger.error(`Tipo de equipe ${id} não encontrado`);
      return {
        success: false,
        message: "Tipo de equipe não encontrado",
      };
    }

    await prisma.teamType.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    logger.info(
      `Tipo de equipe ${id} editado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Tipo de equipe editado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar tipo de equipe: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar tipo de equipe", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar tipo de equipe",
      };
    }
  }
}
