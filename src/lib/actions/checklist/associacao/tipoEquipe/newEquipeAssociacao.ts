"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { z } from "zod";
import { FormState } from "../../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../../types/actions/action-result";
import { ChecklistTeamTypeAssociationSchema } from "@/lib/utils/formSchemas/teamAssossiationFormSchema";

// **Schema de Validação com Zod**

export async function newChecklistTeamTypeAssociation(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newChecklistTeamTypeAssociation action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_associacao,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = ChecklistTeamTypeAssociationSchema.safeParse({
    checklistId: parseInt(formData.get("checklistId")?.toString() || "0"),
    teamTypeId: parseInt(formData.get("teamTypeId")?.toString() || "0"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { checklistId, teamTypeId } = validatedFields.data;

  try {
    // const existingAssociation =
    //   await prisma.checklistTeamTypeAssociation.findFirst({
    //     where: { teamTypeId },
    //   });

    // if (existingAssociation) {
    //   logger.error(
    //     `Associação já existe para o tipo de equipe ID: ${teamTypeId}`
    //   );
    //   return {
    //     success: false,
    //     message: "Esta associação de tipo de equipe já existe.",
    //   };
    // }

    const association = await prisma.checklistTeamTypeAssociation.create({
      data: {
        checklistId,
        teamTypeId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Associação criada com sucesso para o tipo de equipe ${association.teamTypeId} pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Associação de tipo de equipe criada com sucesso.",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(
        `Erro ao criar associação de tipo de equipe: ${error.message}`,
        { error }
      );
      return {
        success: false,
        message: `Erro ao criar associação de tipo de equipe: ${error.message}`,
      };
    } else {
      logger.error("Erro desconhecido ao criar associação de tipo de equipe", {
        error,
      });
      return {
        success: false,
        message: "Erro desconhecido ao criar associação de tipo de equipe.",
      };
    }
  }
}
