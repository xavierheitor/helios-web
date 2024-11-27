"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";

import { FormState } from "../../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../../types/actions/action-result";
import { verifySession } from "@/lib/server/session";
import { ModulePermissionsFormSchema } from "../../../formSchemas/userModulePermission";

export async function editModulePermission(
  state: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editModulePermission action called!", { formData });

  // **Verificação de Autenticação**
  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  const userModulePermissionId = parseInt(
    formData.get("id")?.toString() || "0"
  );
  if (isNaN(userModulePermissionId) || userModulePermissionId <= 0) {
    logger.error(`ID de permissao do modulo inválida: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID de permissao do modulo inválida:",
    };
  }

  // **Conversão dos valores do FormData**
  const rawData = {
    userId: formData.get("userId"),
    module: formData.get("module"),
    canView: formData.get("canView"),
    canCreate: formData.get("canCreate"),
    canEdit: formData.get("canEdit"),
    canDelete: formData.get("canDelete"),
  };

  const convertedData = {
    userId: rawData.userId ? Number(rawData.userId) : undefined,
    module: rawData.module ? String(rawData.module) : undefined,
    canView: rawData.canView === "true",
    canCreate: rawData.canCreate === "true",
    canEdit: rawData.canEdit === "true",
    canDelete: rawData.canDelete === "true",
  };

  const validatedFields = ModulePermissionsFormSchema.safeParse(convertedData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      message: "Erro na validação dos campos",
      errors,
    };
  }

  const { canView, canCreate, canEdit, canDelete, module } =
    validatedFields.data;

  try {
    await prisma.userModulePermission.update({
      where: {
        id: userModulePermissionId,
      },
      data: {
        canView,
        canCreate,
        canEdit,
        canDelete,
        module,
      },
    });

    logger.info("Permissão de módulo editada com sucesso");

    return {
      success: true,
      message: "Permissão de módulo editada com sucesso!",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Erro ao editar permissão de módulo: ${error.message}`, {
        error,
      });
      return {
        success: false,
        message: "Ocorreu um erro ao editar permissão de módulo.",
      };
    } else {
      logger.error("Erro desconhecido ao editar permissão de módulo", {
        error,
      });
      return {
        success: false,
        message: "Erro inesperado. Por favor, tente novamente.",
      };
    }
  }
}
