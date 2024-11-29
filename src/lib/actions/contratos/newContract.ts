"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";
import { MenuKeys } from "@/enums/menus";
import { ContractFormSchema } from "@/lib/utils/formSchemas/contractFormSchema";

export async function newContract(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newContract action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contrato,
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
  const validatedFields = ContractFormSchema.safeParse({
    number: formData.get("number"),
    name: formData.get("name"),
    initialDate: formData.get("initialDate"),
    finalDate: formData.get("finalDate"),
    contractorId: formData.get("contractorId"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { number, name, initialDate, finalDate, contractorId } =
    validatedFields.data;

  try {
    const newContract = await prisma.contract.create({
      data: {
        number: number,
        name: name,
        initialDate: initialDate,
        finalDate: finalDate,
        contractorId: contractorId,
      },
    });

    logger.info(
      `Contrato ${newContract.id} cadastrado com sucesso pelo user: ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Contrato cadastrado com sucesso",
      data: newContract,
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao cadastrar contrato: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao cadastrar contrato", { error });
      return {
        success: false,
        message: "Erro desconhecido ao cadastrar contrato",
      };
    }
  }
}
