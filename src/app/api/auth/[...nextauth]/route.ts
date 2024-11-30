import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma, { setCurrentUserId } from "@/lib/common/prisma";
import bcrypt from "bcrypt";
import type { NextAuthOptions, User } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Usuário",
          type: "text",
          placeholder: "Digite seu usuário",
        },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        // Buscar o usuário no banco de dados pelo username
        const user = await prisma.user.findFirst({
          where: { username, deletedAt: null }, // Adicionado filtro para soft delete
        });

        if (!user) throw new Error("Usuário não encontrado");
        if (!user.password)
          throw new Error("Usuário não tem uma senha configurada");

        // Comparar a senha fornecida com a senha armazenada
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Senha incorreta");

        // Retornar os dados do usuário
        return {
          id: user.id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora
    updateAge: 30 * 60, // Atualizar sessão a cada 30 minutos
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: DefaultJWT;
      user: User;
    }): Promise<DefaultJWT> {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email ?? "";

        // Buscar permissões de contratos
        const contratoPermissions =
          await prisma.userContractPermission.findMany({
            where: {
              userId: parseInt(user.id, 10),
              deletedAt: null, // Ignorar registros removidos logicamente
            },
            select: {
              contractId: true,
              canView: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
            },
          });

        token.allowedContractsId = contratoPermissions.map(
          (perm) => perm.contractId
        ); // IDs permitidos
        token.allowedContracts = contratoPermissions; // Permissões detalhadas

        // Buscar permissões de módulos
        const userPermissions = await prisma.userModulePermission.findMany({
          where: {
            userId: parseInt(user.id, 10),
            deletedAt: null, // Ignorar registros removidos logicamente
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

        token.modulesPermissions = userPermissions.reduce((acc, perm) => {
          acc[perm.module] = {
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            menuKey: perm.menuKey,
            href: perm.href,
          };
          return acc;
        }, {} as Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; menuKey: string | null; href: string | null }>);

        return token;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: DefaultJWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.allowedContractsId = token.allowedContractsId as number[];
        session.user.allowedContracts = token.allowedContracts || [];
        session.user.modulesPermissions = token.modulesPermissions || {};

        // Define o ID do usuário logado no Prisma para logs
        setCurrentUserId(parseInt(token.id as string, 10));
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Exportar funções nomeadas para cada método HTTP
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
