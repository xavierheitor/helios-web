// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma, { setCurrentUserId } from "@/lib/common/prisma"; // Adicionado o método setCurrentUserId
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
          where: {
            username: username,
          },
        });

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        if (!user.password) {
          throw new Error("Usuário não tem uma senha configurada");
        }

        // Comparar a senha fornecida com a senha armazenada (criptografada)
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Senha incorreta");
        }

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
    maxAge: 60 * 60, // 1 hora em segundos
    updateAge: 30 * 60, // Atualiza a sessão a cada 30 minutos
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: DefaultJWT;
      user: User;
    }): Promise<DefaultJWT> {
      // Se houver um usuário, adicione os dados dele ao token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email ?? "";

        // Buscar permissões do usuário no modelo userContratoPermission
        const contratoPermitions = await prisma.userContractPermission.findMany(
          {
            where: {
              userId: parseInt(user.id, 10),
            },
          }
        );
        // Extrair contratos permitidos
        const allowedContratos: number[] = contratoPermitions.map(
          (permission) => permission.contractId
        );
        token.allowedContratos = allowedContratos;

        // Buscar permissões do usuário no modelo permission
        const userPermissions = await prisma.userModulePermission.findMany({
          where: {
            userId: parseInt(user.id, 10),
          },
        });

        // Estruturar as permissões em um objeto para facilitar o acesso no frontend
        token.permissions = userPermissions.reduce((acc, perm) => {
          const key = perm.module; // Removido contratoId das chaves
          acc[key] = {
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
          };
          return acc;
        }, {} as Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }>);

        // Buscar permissões do usuário no modelo userMenuPermission
        const menusPermissions = await prisma.userMenuPermission.findMany({
          where: {
            userId: parseInt(user.id, 10),
          },
        });

        token.menuPermissions = menusPermissions.map((menu) => ({
          key: menu.menuKey,
          href: menu.href,
        }));

        return token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: DefaultJWT }) {
      // Adicione o ID e username do usuário à sessão
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.allowedContratos =
          (token.allowedContratos as number[]) || [];

        // Adicione as permissões à sessão
        session.user.modulesPermissions =
          (token.modulesPermissions as Record<
            string,
            {
              canView: boolean;
              canCreate: boolean;
              canEdit: boolean;
              canDelete: boolean;
            }
          >) || {};

        session.user.menuPermissions = token.menuPermissions || [];

        // Define o ID do usuário logado no Prisma
        setCurrentUserId(parseInt(token.id as string, 10)); // Integração com o ActionLog
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redireciona para a página de login em caso de erro
  },
  secret: process.env.NEXTAUTH_SECRET, // Defina uma variável de ambiente para a chave secreta do NextAuth
  debug: process.env.NODE_ENV === "development",
};

// Exportar funções nomeadas para cada método HTTP
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
