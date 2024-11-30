"use server";

import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { FormState } from "../../../../types/actions/form-state";
import { ActionResult } from "../../../../types/actions/action-result";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { EmployeeFormSchema } from "@/lib/utils/formSchemas/employeeFormSchema";

export async function newFuncionario(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("newFuncionario action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_funcionario,
    PERMISSIONS.CREATE
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  // **Validação dos Campos do Formulário**
  const validatedFields = EmployeeFormSchema.safeParse({
    name: formData.get("name"),
    cpf: formData.get("cpf"),
    rg: formData.get("rg"),
    email: formData.get("email"),
    birthDate: formData.get("birthDate"),
    contact: formData.get("contact"),
    admissionDate: formData.get("admissionDate"),
    resingationDate: formData.get("resingationDate"),
    city: formData.get("city"),
    estate: formData.get("estate"),
    cep: formData.get("cep"),
    address: formData.get("address"),
    number: formData.get("number"),
    district: formData.get("district"),
    registration: formData.get("registration"),
    contractId: formData.get("contractId"),
    roleId: formData.get("roleId"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    logger.error("Campos do formulário inválidos", { errors });
    return {
      success: false,
      errors,
    };
  }

  const {
    name,
    cpf,
    rg,
    email,
    birthDate,
    contact,
    admissionDate,
    resingationDate,
    city,
    estate,
    cep,
    address,
    number,
    district,
    registration,
    contractId,
    roleId,
  } = validatedFields.data;

  try {
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        cpf,
        rg,
        email,
        birthDate,
        contact,
        admissionDate,
        resingationDate,
        city,
        estate,
        cep,
        address,
        number,
        district,
        registration,
        contractId,
        roleId,
        createdByUser: permissionCheck.userId,
      },
    });

    logger.info(
      `Funcionário criado com sucesso: ${newEmployee.id} pelo usuário ${permissionCheck.userId}`
    );

    return {
      success: true,
      message: "Funcionário criado com sucesso",
      data: newEmployee,
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao criar funcionário: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao criar funcionário", { error });
      return {
        success: false,
        message: "Erro desconhecido ao criar funcionário",
      };
    }
  }
}
