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

export async function editFuncionario(
  formState: FormState,
  formData: FormData
): Promise<ActionResult> {
  logger.info("editFuncionario action called", { formData });

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_funcionario,
    PERMISSIONS.EDIT
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  const id = parseInt(formData.get("id")?.toString() || "0");
  if (isNaN(id) || id <= 0) {
    logger.error(`ID do Funcionário inválido: ${formData.get("id")}`);
    throw new SWRError("ID inválido");
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
    const employee = await prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      logger.error(`Funcionário ${id} não encontrado`);
      return {
        success: false,
        message: "Funcionário não encontrado",
      };
    }

    await prisma.employee.update({
      where: { id },
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
      },
    });

    logger.info(
      `Funcionário ${id} editado com sucesso pelo user: ${permissionCheck.userId}`
    );
    return {
      success: true,
      message: "Funcionário editado com sucesso",
    };
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao editar funcionário: ${error.message}`, { error });
      return {
        success: false,
        message: error.message,
      };
    } else {
      logger.error("Erro desconhecido ao editar funcionário", { error });
      return {
        success: false,
        message: "Erro desconhecido ao editar funcionário",
      };
    }
  }
}
