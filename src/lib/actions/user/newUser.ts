"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import bcrypt from "bcrypt";

import { ActionResult } from "../../../../types/actions/action-result";
import { FormState } from "../../../../types/actions/form-state";
import { verifySession } from "@/lib/server/session";
import { UserFormSchema } from "../formSchemas/userFormSchema";

/**
 * Cria um novo User.
 * @param state - Estado do formulário.
 * @param formData - Dados do formulário enviados pelo usuário.
 * @returns Resultado da ação contendo sucesso, mensagem e possíveis erros.
 */
export async function newUser(
  state: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newUser action called", { formData });

  // **Verificação de Autenticação**
  const session = await verifySession();
  if (!session?.isAuth) {
    logger.error("Usuário não autenticado");
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  // **Validação dos Campos do Formulário**
  const validatedFields = UserFormSchema.safeParse({
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

  try {
    // **Criptografar a Senha**
    const hashedPassword = await bcrypt.hash(password || "", 10);

    // **Verificar Unicidade do Username**
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
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

    // **Criar o User no Banco de Dados**
    await prisma.user.create({
      data: {
        name: name.trim(),
        username: username.trim(),
        password: hashedPassword,
      },
    });

    logger.info("User criado com sucesso");
    return {
      success: true,
      message: "Usuário criado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar user: ${error.message}`, { error });
      return {
        success: false,
        message: "Ocorreu um erro ao criar o usuário.",
      };
    } else {
      logger.error("Erro desconhecido ao criar user", { error });
      return {
        success: false,
        message: "Ocorreu um erro ao criar o usuário.",
      };
    }
  }
}
