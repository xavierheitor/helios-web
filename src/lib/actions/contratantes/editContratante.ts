"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { MenuKeys } from "@/enums/menus";
import { ContractorFormSchema } from "../aa-formSchemas/contratante";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";

export async function editContratante(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editContratante action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contratante,
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
    logger.error(`ID do Contratante inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID inválido",
    };
  }

  // **Validação dos Campos do Formulário**
  const validatedFields = ContractorFormSchema.safeParse({
    name: formData.get("name"),
    cnpj: formData.get("cnpj"),
    state: formData.get("state"),
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

  const { name, cnpj, state } = validatedFields.data;

  try {
    const contratante = await prisma.contractor.update({
      where: {
        id,
      },
      data: {
        name,
        cnpj,
        state,
      },
    });

    logger.info(`Contratante ${contratante.id} editado com sucesso`);

    return {
      success: true,
      message: "Contratante editado com sucesso",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao editar contratante: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar contratante", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar contratante",
      };
    }
  }
}
