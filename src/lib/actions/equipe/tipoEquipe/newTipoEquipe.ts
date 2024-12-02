"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { FormState } from "../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../types/actions/action-result";
import { TeamTypeFormSchema } from "@/lib/utils/formSchemas/tipoEquipeFormSchema";

export async function newTipoEquipe(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newTipoEquipe action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_tipoEquipe,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
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
    const tipoEquipe = await prisma.teamType.create({
      data: {
        name,
        description,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Tipo de equipe ${tipoEquipe.id} criado com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Tipo de equipe criado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar tipo de equipe: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar tipo de equipe", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar tipo de equipe",
      };
    }
  }
}
