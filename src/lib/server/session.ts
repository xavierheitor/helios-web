"use server";

import { getServerSession } from "next-auth/next";
import { UserContractPermission } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma, { setCurrentUserId } from "@/lib/common/prisma";
import { redirect } from "next/navigation";
import { logger } from "../common/logger";

interface ExtendedSession {
  userId: number;
  allowedContratos: Partial<UserContractPermission>[];
  allowedContratosIds: number[];
  modulesPermissions: Record<
    string,
    {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      menuKey?: string | null;
      href?: string | null;
    }
  >;
  isAuth: boolean;
}

/**
 * Verifica a sessão do usuário utilizando NextAuth.js.
 * Define o ID do usuário no contexto do Prisma.
 * Redireciona para /login caso a sessão não seja válida.
 * @returns ExtendedSession ou redireciona para /login
 */
export async function verifySession(): Promise<ExtendedSession | null> {
  try {
    // Obtém a sessão utilizando NextAuth
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      handleRedirection("/login");
      return null;
    }

    const userId = parseInt(session.user.id, 10);

    if (isNaN(userId)) {
      console.error("ID do usuário inválido na sessão:", session.user.id);
      handleRedirection("/login");
      return null;
    }

    // Define o ID do usuário no contexto do Prisma
    setCurrentUserId(userId);

    // Buscar permissões do usuário no banco de dados - Contratos
    const contractPermissions = await prisma.userContractPermission.findMany({
      where: { userId },
      select: {
        contractId: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canView: true,
      },
    });

    // Processa as permissões de contratos para um formato simplificado
    const allowedContratos: Partial<UserContractPermission>[] =
      contractPermissions.map((permission) => ({
        contractId: permission.contractId,
        canCreate: permission.canCreate,
        canEdit: permission.canEdit,
        canDelete: permission.canDelete,
        canView: permission.canView,
      }));

    // Extrai os IDs dos contratos permitidos
    const allowedContratosIds = contractPermissions
      .map((permission) => permission.contractId)
      .filter((id): id is number => id !== null && id !== undefined);

    // Buscar permissões do usuário no banco de dados - Módulos
    const modulePermissions = await prisma.userModulePermission.findMany({
      where: { userId },
      select: {
        module: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        menuKey: true,
        href: true,
      },
    });

    // Processa as permissões de módulos para um formato simplificado
    const modulesPermissions = modulePermissions.reduce(
      (acc, permission) => {
        acc[permission.module] = {
          canCreate: permission.canCreate,
          canEdit: permission.canEdit,
          canDelete: permission.canDelete,
          canView: permission.canView,
          menuKey: permission.menuKey,
          href: permission.href,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          canView: boolean;
          canCreate: boolean;
          canEdit: boolean;
          canDelete: boolean;
          menuKey?: string | null;
          href?: string | null;
        }
      >
    );

    logger.info("Session verified:", {
      userId,
      allowedContratos,
      modulesPermissions,
    });

    // Retorna a sessão estendida com permissões e autenticação
    return {
      userId,
      allowedContratos,
      allowedContratosIds,
      modulesPermissions,
      isAuth: true,
    };
  } catch (error) {
    console.error("Erro ao verificar a sessão:", error);
    handleRedirection("/login");
    return null;
  }
}

/**
 * Redireciona para a URL especificada e registra o evento.
 * @param url URL de redirecionamento
 */
function handleRedirection(url: string) {
  console.warn("Redirecionando para:", url);
  redirect(url);
}
