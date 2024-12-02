"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { TeamFormSchema } from "@/lib/utils/formSchemas/equipeFormSchema";

export async function editEquipe(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editEquipe action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_equipe,
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
    logger.error(`ID da equipe inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID da equipe inválido",
    };
  }

  const validatedFields = TeamFormSchema.safeParse({
    name: formData.get("name"),
    contractId: formData.get("contractId"),
    teamsTypeId: formData.get("teamsTypeId"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { name, contractId, teamTypeId } = validatedFields.data;

  try {
    const equipe = prisma.team.findUnique({ where: { id } });

    if (!equipe) {
      logger.error(`Equipe ${id} não encontrada`);
      return {
        success: false,
        message: "Equipe não encontrada",
      };
    }

    await prisma.team.update({
      where: { id },
      data: {
        name,
        contractId,
        teamTypeId,
      },
    });

    logger.info(
      `Equipe ${id} editada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Equipe editada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar equipe: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar equipe", { error });
      return {
        success: false,
        message: "Ocorreu um erro ao editar a equipe.",
      };
    }
  }
}
