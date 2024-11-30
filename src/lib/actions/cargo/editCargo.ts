"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { RoleFormSchema } from "@/lib/utils/formSchemas/roleFormSchema";

export async function editCargo(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editCargo action called", { formData });

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
    logger.error(`ID do Cargo inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID inválido",
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
    const cargo = await prisma.role.findUnique({ where: { id } });

    if (!cargo) {
      logger.error(`Cargo ${id} não encontrado`);
      return {
        success: false,
        message: "Cargo não encontrado",
      };
    }

    await prisma.role.update({
      where: { id },
      data: {
        name: name,
        description: description,
        baseSalary: baseSalary,
      },
    });

    logger.info(
      `Cargo ${id} editado com sucesso pelo user: ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Cargo editado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar cargo: ${error.message}`, { error });
    } else {
      logger.error("Erro desconhecido ao editar cargo", { error });
    }
    return {
      success: false,
      message: "Ocorreu um erro ao editar o cargo.",
    };
  }
}
