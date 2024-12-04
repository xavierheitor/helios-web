"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { z } from "zod";
import { FormState } from "../../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../../types/actions/action-result";
import { EditChecklistTeamTypeAssociationSchema } from "@/lib/utils/formSchemas/teamAssossiationFormSchema";

export async function editChecklistTeamTypeAssociation(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editChecklistTeamTypeAssociation action called", formData);

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_checklist_associacao,
    PERMISSIONS.EDIT
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const validatedFields = EditChecklistTeamTypeAssociationSchema.safeParse({
    id: parseInt(formData.get("id")?.toString() || "0"),
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

  const { id, teamTypeId } = validatedFields.data;

  try {
    const association = await prisma.checklistTeamTypeAssociation.findUnique({
      where: { id },
    });

    if (!association) {
      logger.error(`Associação não encontrada: ID ${id}`);
      return {
        success: false,
        message: "Associação não encontrada.",
      };
    }

    if (association.teamTypeId !== teamTypeId) {
      // Verificar se a nova teamTypeId já está associada
      const existingAssociation =
        await prisma.checklistTeamTypeAssociation.findUnique({
          where: { teamTypeId },
        });

      if (existingAssociation) {
        logger.error(
          `Associação já existe para o tipo de equipe ID: ${teamTypeId}`
        );
        return {
          success: false,
          message: "Esta associação de tipo de equipe já existe.",
        };
      }
    }

    const updatedAssociation = await prisma.checklistTeamTypeAssociation.update(
      {
        where: { id },
        data: {
          teamTypeId,
          createdByUser: permissionCheck.userId,
        },
      }
    );

    logger.info(
      `Associação ID ${updatedAssociation.id} atualizada com sucesso pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Associação de tipo de equipe atualizada com sucesso.",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(
        `Erro ao editar associação de tipo de equipe: ${error.message}`,
        { error }
      );
      return {
        success: false,
        message: `Erro ao editar associação de tipo de equipe: ${error.message}`,
      };
    } else {
      logger.error("Erro desconhecido ao editar associação de tipo de equipe", {
        error,
      });
      return {
        success: false,
        message: "Erro desconhecido ao editar associação de tipo de equipe.",
      };
    }
  }
}
