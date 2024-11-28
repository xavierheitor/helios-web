"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { FormState } from "../../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../../types/actions/action-result";
import { verifySession } from "@/lib/server/session";
import { ContractPermissionsFormSchema } from "../../../../utils/formSchemas/userContractPermission";

/**
 * Edita uma Permissao existente.
 * @param state - Estado do formulário.
 * @param formData - Dados do formulário enviados pelo usuário.
 * @returns Resultado da ação contendo sucesso, mensagem e possíveis erros.
 */
export async function editContractPermission(
  state: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editContractPermission action called!", { formData });

  // **Verificação de Autenticação**
  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  const userContractPermissionId = parseInt(
    formData.get("id")?.toString() || "0"
  );
  if (isNaN(userContractPermissionId) || userContractPermissionId <= 0) {
    logger.error(`ID do User inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID do usuário inválido",
    };
  }

  // **Validação dos Campos do Formulário**
  const rawData = {
    contractId: formData.get("contractId"),
    userId: formData.get("userId"),
    canView: formData.get("canView"),
    canCreate: formData.get("canCreate"),
    canEdit: formData.get("canEdit"),
    canDelete: formData.get("canDelete"),
  };

  const convertedData = {
    contractId: rawData.contractId ? Number(rawData.contractId) : undefined,
    userId: rawData.userId ? Number(rawData.userId) : undefined,
    canView: rawData.canView === "true",
    canCreate: rawData.canCreate === "true",
    canEdit: rawData.canEdit === "true",
    canDelete: rawData.canDelete === "true",
  };

  // **Validação dos Campos do Formulário**
  const validatedFields =
    ContractPermissionsFormSchema.safeParse(convertedData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      message: "Erro na validação dos campos",
      errors,
    };
  }

  const { canView, canCreate, canEdit, canDelete } = validatedFields.data;

  try {
    const userContractPermission =
      await prisma?.userContractPermission.findUnique({
        where: {
          id: userContractPermissionId,
        },
      });

    if (!userContractPermission) {
      logger.error(
        `UserContractPermission com ID ${userContractPermission} não encontrado`
      );
      return {
        success: false,
        message: "Permissao não encontrado",
      };
    }
    await prisma.userContractPermission.update({
      where: {
        id: userContractPermissionId,
      },
      data: {
        canView,
        canCreate,
        canEdit,
        canDelete,
      },
    });

    logger.info("Permissao editada com sucesso");

    return {
      success: true,
      message: "Permissão de contrato editada com sucesso!",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar permissao de contrato: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: "Ocorreu um erro ao editar  permissao de contrato.",
      };
    } else {
      logger.error("Erro desconhecido ao editar  permissao de contrato", {
        error,
      });
      return {
        success: false,
        message: "Ocorreu um erro ao editar  permissao de contrato.",
      };
    }
  }
}
