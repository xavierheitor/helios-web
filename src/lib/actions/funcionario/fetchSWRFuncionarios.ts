"use server";

import { MenuKeys } from "@/enums/menus";
import { PERMISSIONS } from "@/enums/permissions";
import { SWRError } from "@/lib/common/errors/SWRError";
import { logger } from "@/lib/common/logger";
import prisma from "@/lib/common/prisma";
import { checkUserPermissions } from "@/lib/server/checkUserPermission";
import { EmployeeWithRelations } from "@/lib/utils/prismaTypes/employeeWithRelations";

export async function fetchSWRFuncionarios(): Promise<EmployeeWithRelations[]> {
  logger.info("fetchSWRFuncionarios action called");

  // **Verificação de Permissões**
  const permissionCheck = await checkUserPermissions(
    MenuKeys.cadastros_funcionario,
    PERMISSIONS.VIEW
  );

  if (!permissionCheck.allowed) {
    logger.error("Permissão negada:", permissionCheck.message);
    throw new SWRError(permissionCheck.message);
  }

  try {
    const employees = await prisma.employee.findMany({
      include: {
        role: true,
        contract: true,
      },
    });

    logger.info(
      `Usuário ${permissionCheck?.userId} buscou ${employees.length} funcionários`
    );

    console.log(employees);

    return employees;
  } catch (error: unknown) {
    // **Tratamento de Erros**
    if (error instanceof Error) {
      logger.error(`Erro ao buscar funcionários: ${error.message}`, { error });
      throw new SWRError(error.message);
    } else {
      logger.error("Erro desconhecido ao buscar funcionários", { error });
      throw new SWRError("Erro desconhecido ao buscar funcionários");
    }
  }
}
