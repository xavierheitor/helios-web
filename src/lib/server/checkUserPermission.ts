import { verifySession } from "@/lib/server/session";
import { logger } from "@/lib/common/logger";
import { MenuKeys } from "@/enums/menus"; // Certifique-se de que MenuKeys está exportado corretamente
import { PERMISSIONS } from "@/enums/permissions";
import { UserContractPermission } from "@prisma/client";

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
  if (!session?.isAuth) {
    logger.error("User not authenticated");
    return { allowed: false, message: "Usuário não autenticado" };
  }

  // Obter permissões de módulos da sessão
  const permissions = session?.modulesPermissions || {};

  // Verificar permissão no módulo
  const permission = Object.values(permissions).find(
    (perm) => perm.menuKey === moduleKey
  );

  if (!permission || !permission[action]) {
    logger.warn({
      message: `Permission denied`,
      details: {
        userId: session.userId,
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

  // Obter lista de contratos permitidos (IDs e permissões detalhadas)
  const allowedContracts = session?.allowedContratos || [];
  const allowedContractsId = allowedContracts.map(
    (contract) => contract.contractId
  ) as number[];

  if (allowedContracts.length === 0) {
    logger.warn({
      message: `No allowed contracts found`,
      details: { userId: session.userId },
    });
  } else {
    logger.info({
      message: `Allowed contracts retrieved`,
      details: { userId: session.userId, allowedContracts },
    });
  }

  logger.info({
    message: `Permission granted`,
  });

  return {
    allowed: true,
    message: "Permissão concedida",
    userId: session.userId,
    allowedContractsId,
    allowedContracts,
  };
}
