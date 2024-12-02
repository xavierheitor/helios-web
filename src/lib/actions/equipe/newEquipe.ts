"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { TeamFormSchema } from "@/lib/utils/formSchemas/equipeFormSchema";

export async function newEquipe(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(`newEquipe action called`, formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_equipe,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = TeamFormSchema.safeParse({
    name: formData.get("name"),
    contractId: formData.get("contractId"),
    teamTypeId: formData.get("teamTypeId"),
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
    const equipe = await prisma.team.create({
      data: {
        name,
        contractId,
        teamTypeId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Equipe ${equipe.id} criada com sucesso pelo usuário ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Equipe criada com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar equipe: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar equipe", { error });
      return {
        success: false,
        message: "Ocorreu um erro ao criar a equipe.",
      };
    }
  }
}
