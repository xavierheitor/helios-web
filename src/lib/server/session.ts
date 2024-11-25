"use server";

import { getServerSession } from "next-auth/next";
import { UserContractPermission } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma, { setCurrentUserId } from "@/lib/common/prisma"; // Importação da função setCurrentUserId
import { redirect } from "next/navigation";

interface ExtendedSession {
  userId: number;
  allowedContratos: Partial<UserContractPermission>[];
  isAuth: boolean;
}

/**
 * Verifica a sessão do usuário utilizando NextAuth.js.
 * Define o ID do usuário no contexto do Prisma.
 * Redireciona para /login caso a sessão não seja válida.
 * @returns ExtendedSession ou redireciona para /login
 */
export async function verifySession(): Promise<ExtendedSession | null> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
    return null;
  }

  const userId = parseInt(session.user.id, 10);

  // Define o ID do usuário no contexto do Prisma
  setCurrentUserId(userId);

  // Buscar permissões do usuário
  const contractPermission = await prisma.userContractPermission.findMany({
    where: {
      userId: userId,
    },
    select: {
      contractId: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canView: true,
    },
  });

  const allowedContratos: Partial<UserContractPermission>[] =
    contractPermission.map((permission) => ({
      contractId: permission.contractId,
      canCreate: permission.canCreate,
      canEdit: permission.canEdit,
      canDelete: permission.canDelete,
      canView: permission.canView,
    }));

  return {
    userId,
    allowedContratos,
    isAuth: true,
  };
}
