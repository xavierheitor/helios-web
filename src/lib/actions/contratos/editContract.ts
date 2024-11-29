"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { ContractFormSchema } from "@/lib/utils/formSchemas/contractFormSchema";

export async function editContract(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editContract action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_contrato,
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
    logger.error(`ID do Contrato inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID inválido",
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
      message: "Erro na validação dos campos",
      errors,
    };
  }

  const { number, name, initialDate, finalDate, contractorId } =
    validatedFields.data;

  try {
    const updatedContract = await prisma.contract.update({
      where: {
        id,
      },
      data: {
        number: number,
        name: name,
        initialDate: initialDate,
        finalDate: finalDate,
        contractorId: contractorId,
      },
    });

    logger.info(
      `Contrato ${updatedContract.id} editado com sucesso pelo user: ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Contrato editado com sucesso",
      data: updatedContract,
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar contrato: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar contrato", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar contrato",
      };
    }
  }
}
