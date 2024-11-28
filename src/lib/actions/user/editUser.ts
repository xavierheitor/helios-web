"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

import { ActionResult } from "../../../../types/actions/action-result";
import { FormState } from "../../../../types/actions/form-state";
import { UserFormSchema } from "../../utils/formSchemas/userFormSchema";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";

/**
 * Edita um User existente.
 * @param state - Estado do formulário do User.
 * @param formData - Dados do formulário enviados pelo usuário.
 * @returns Resultado da ação contendo sucesso, mensagem e possíveis erros.
 */
export async function editUser(
  state: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editUser action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.usuarios_list,
    PERMISSIONS.EDIT
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    return {
      success: false,
      message: permissionCheck.message,
    };
  }

  const userId = parseInt(formData.get("id")?.toString() || "0");

  if (isNaN(userId) || userId <= 0) {
    logger.error(`ID do User inválido: ${formData.get("id")}`);
    return {
      success: false,
      message: "ID do usuário inválido",
    };
  }

  // **Validação dos Campos do Formulário**
  const validatedFields = UserFormSchema.partial().safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
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

  const { name, username, password } = validatedFields.data;

  // **Montar Dados de Atualização**
  const updateData: Partial<User> = {};
  if (name) updateData.name = name.trim();
  if (username) updateData.username = username.trim();

  // **Atualizar Senha se Fornecida**
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  }

  try {
    // **Verificar Existência do User**
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.error(`User com ID ${userId} não encontrado`);
      return {
        success: false,
        message: "Usuário não encontrado",
      };
    }

    // **Verificar Unicidade do Username (Excluindo o User Atual)**
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username.trim(),
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        logger.error(`Username ${username} já existe`);
        return {
          success: false,
          message: "Nome de usuário já existe",
          errors: {
            username: ["Nome de usuário já está em uso"],
          },
        };
      }
    }

    // **Atualizar o User no Banco de Dados**
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    logger.info("User atualizado com sucesso");
    return {
      success: true,
      message: "Usuário atualizado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar user: ${error.message}`, { error });
      return {
        success: false,
        message: "Ocorreu um erro ao editar o usuário.",
      };
    } else {
      logger.error("Erro desconhecido ao editar user", { error });
      return {
        success: false,
        message: "Ocorreu um erro ao editar o usuário.",
      };
    }
  }
}
