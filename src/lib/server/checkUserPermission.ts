import { verifySession } from "@/lib/server/session";
import { logger } from "@/lib/common/logger";
import { MenuKeys } from "@/enums/menus"; // Certifique-se de que MenuKeys está exportado corretamente
import { PERMISSIONS } from "@/enums/permissions";
import prisma from "@/lib/common/prisma"; // Importar o Prisma Client
import { UserContractPermission } from "@prisma/client"; // Importar o tipo se necessário

export async function checkUserPermissions(
  moduleKey: keyof typeof MenuKeys, // Garantir que moduleKey seja uma chave válida de MenuKeys
  action: PERMISSIONS
): Promise<{
  allowed: boolean;
  message: string;
  userId?: number;
  allowedContractsId?: number[];
  allowedContracts?: Partial<UserContractPermission>[];
}> {
  const session = await verifySession();

  logger.info(
    `Checking permissions for user ${session?.userId} on module ${moduleKey} for action ${action}`
  );

  // Verificar sessão
  if (!session?.isAuth || !session.userId) {
    logger.error("User not authenticated");
    return { allowed: false, message: "Usuário não autenticado" };
  }

  const userId = session.userId;

  // Obter permissões de módulos do banco de dados
  const userPermissions = await prisma.userModulePermission.findMany({
    where: {
      userId: userId,
      deletedAt: null,
    },
    select: {
      module: true,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      menuKey: true,
      href: true,
    },
  });

  // Verificar permissão no módulo
  const permission = userPermissions.find((perm) => perm.menuKey === moduleKey);

  if (!permission || !permission[action]) {
    logger.warn({
      message: `Permission denied`,
      details: {
        userId,
        moduleKey,
        action,
        reason: !permission
          ? "No permission record found"
          : `Action ${action} is not allowed`,
      },
    });

    return {
      allowed: false,
      message: `Você não tem permissão para executar esta ação.`,
    };
  }

  // Obter lista de contratos permitidos (IDs e permissões detalhadas) do banco de dados
  const userContractPermissions = await prisma.userContractPermission.findMany({
    where: {
      userId: userId,
      deletedAt: null,
    },
    select: {
      contractId: true,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  });

  const allowedContractsId = userContractPermissions.map(
    (contract) => contract.contractId
  );

  if (userContractPermissions.length === 0) {
    logger.warn({
      message: `No allowed contracts found`,
      details: { userId },
    });
  } else {
    logger.info({
      message: `Allowed contracts retrieved`,
      details: { userId, allowedContracts: userContractPermissions },
    });
  }

  logger.info({
    message: `Permission granted`,
  });

  return {
    allowed: true,
    message: "Permissão concedida",
    userId,
    allowedContractsId,
    allowedContracts: userContractPermissions,
  };
}
