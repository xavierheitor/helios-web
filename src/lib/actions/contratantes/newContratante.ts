"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { verifySession } from "@/lib/server/session";
import { ContractorFormSchema } from "../../utils/formSchemas/contratante";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";

export async function newContratante(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newContratante action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contratante,
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
    const newContratante = await prisma.contractor.create({
      data: {
        name: name,
        cnpj: cnpj,
        state: state,
      },
    });

    logger.info(`Contratante ${newContratante.id} criado com sucesso`);

    return {
      success: true,
      message: "Contratante criado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar contratante: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar contratante", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar contratante",
      };
    }
  }
}
