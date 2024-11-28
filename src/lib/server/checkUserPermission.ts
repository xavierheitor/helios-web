import { verifySession } from "@/lib/server/session";
import { logger } from "@/lib/common/logger";
import { MenuKeys } from "@/enums/menus"; // Certifique-se de que MenuKeys está exportado corretamente
import { PERMISSIONS } from "@/enums/permissions";

export async function checkUserPermissions(
  moduleKey: keyof typeof MenuKeys, // Garantir que moduleKey seja uma chave válida de MenuKeys
  action: PERMISSIONS
): Promise<{ allowed: boolean; message: string }> {
  const session = await verifySession();

  logger.info(
    `Checking permissions for user ${session?.userId} on module ${moduleKey}`
  );

  // Verificar sessão

  if (!session?.isAuth) {
    logger.error("User not authenticated");
    return { allowed: false, message: "Usuário não autenticado" };
  }

  // Obter permissões da sessão
  const permissions = session?.modulesPermissions || {};

  // Verificar permissão no módulo
  const permission = Object.values(permissions).find(
    (perm) => perm.menuKey === moduleKey
  );

  if (!permission || !permission[action]) {
    logger.warn(
      `Permission denied for user ${session?.userId} on module ${moduleKey} for action ${action}`
    );
    return {
      allowed: false,
      message: "Você não tem permissão para executar esta ação.",
    };
  }

  logger.info(
    `Permission granted for user ${session?.userId} on module ${moduleKey} for action ${action}`
  );
  return { allowed: true, message: "Permissão concedida" };
}
