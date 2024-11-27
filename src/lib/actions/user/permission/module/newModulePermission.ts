"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../../../types/actions/form-state";
import { ActionResult } from "../../../../../../types/actions/action-result";
import { verifySession } from "@/lib/server/session";
import { ModulePermissionsFormSchema } from "../../../formSchemas/userModulePermission";

export async function newModulePermission(
  state: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newModulePermission action called", { formData });

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
    userId: formData.get("userId"),
    module: formData.get("module"),
    menuKey: formData.get("menuKey"),
    href: formData.get("href"),
    canView: formData.get("canView"),
    canCreate: formData.get("canCreate"),
    canEdit: formData.get("canEdit"),
    canDelete: formData.get("canDelete"),
  };

  const convertedData = {
    userId: rawData.userId ? Number(rawData.userId) : undefined,
    module: rawData.module ? String(rawData.module) : undefined,
    menuKey: rawData.menuKey ? String(rawData.menuKey) : undefined,
    href: rawData.href ? String(rawData.href) : undefined,
    canView: rawData.canView === "true",
    canCreate: rawData.canCreate === "true",
    canEdit: rawData.canEdit === "true",
    canDelete: rawData.canDelete === "true",
  };

  // **Validação dos Campos do Formulário**
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

  const {
    userId,
    module,
    menuKey,
    href,
    canView,
    canCreate,
    canEdit,
    canDelete,
  } = validatedFields.data;

  try {
    await prisma?.userModulePermission.create({
      data: {
        userId,
        module,
        menuKey,
        href,
        canView,
        canCreate,
        canEdit,
        canDelete,
      },
    });

    logger.info("Permissão de módulo criada com sucesso");

    return {
      success: true,
      message: "Permissão de módulo criada com sucesso!",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      const isConstraintError = error.message.includes(
        "Unique constraint failed"
      );

      if (isConstraintError) {
        logger.error("Tentativa de duplicação de permissão", { error });
        return {
          success: false,
          message: "Essa permissão de módulo já existe para o usuário.",
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
