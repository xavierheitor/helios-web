"use server";

import { logger } from "@/lib/common/logger";
import { ActionResult } from "../../../../../../types/actions/action-result";
import { FormState } from "../../../../../../types/actions/form-state";
import { verifySession } from "@/lib/server/session";
import { ContractPermissionsFormSchema } from "../../../aa-formSchemas/userContractPermission";

export async function newContractPermission(
  state: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info(`newContractPermission action called ${formData}`);

  // **Verificação de Autenticação**
  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  // **Conversão dos valores do FormData**
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

  const { contractId, userId, canView, canCreate, canEdit, canDelete } =
    validatedFields.data;

  try {
    await prisma?.userContractPermission.create({
      data: {
        contractId: Number(contractId),
        userId: Number(userId),
        canView: canView,
        canCreate: canCreate,
        canEdit: canEdit,
        canDelete: canDelete,
      },
    });

    logger.info("Permissao criada com sucesso");

    return {
      success: true,
      message: "Permissão de contrato criada com sucesso!",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      const isConstraintError = error.message.includes(
        "Unique constraint failed"
      );
      const isForeignKeyError = error.message.includes(
        "Foreign key constraint failed"
      );

      if (isConstraintError) {
        logger.error("Tentativa de duplicação de permissão", { error });
        return {
          success: false,
          message: "Essa permissão de contrato já existe para o usuário.",
        };
      }

      if (isForeignKeyError) {
        logger.error("Erro de chave estrangeira ao criar permissão", { error });
        return {
          success: false,
          message:
            "O contrato ou o usuário associado não foi encontrado. Verifique os dados e tente novamente.",
        };
      }

      logger.error(`Erro ao criar permissão: ${error.message}`, { error });
      return {
        success: false,
        message:
          "Ocorreu um erro ao criar a permissão. Tente novamente mais tarde.",
      };
    } else {
      logger.error("Erro desconhecido ao criar permissão", { error });
      return {
        success: false,
        message: "Erro inesperado. Por favor, tente novamente mais tarde.",
      };
    }
  }
}
