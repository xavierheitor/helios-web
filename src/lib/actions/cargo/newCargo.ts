"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { PERMISSIONS } from "@/enums/permissions";
import { MenuKeys } from "@/enums/menus";
import { RoleFormSchema } from "@/lib/utils/formSchemas/roleFormSchema";

export async function newCargo(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newCargo action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_cargo,
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
  const validatedFields = RoleFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    baseSalary: formData.get("baseSalary"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const { name, description, baseSalary } = validatedFields.data;

  try {
    const newCargo = await prisma.role.create({
      data: {
        name: name,
        description: description,
        baseSalary: baseSalary,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Cargo criado com sucesso: ${newCargo.id} pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Cargo criado com sucesso",
      data: newCargo,
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar cargo: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar cargo", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar cargo",
      };
    }
  }
}
