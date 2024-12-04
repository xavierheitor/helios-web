import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma, { setCurrentUserId } from "@/lib/common/prisma";
import bcrypt from "bcrypt";

type ModulesPermission = Record<
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
          where: { username, deletedAt: null },
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email ?? "";

        // Buscar permissões de módulos
        const userPermissions = await prisma.userModulePermission.findMany({
          where: {
            userId: parseInt(user.id, 10),
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
        }, {} as ModulesPermission);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.modulesPermissions =
          (token.modulesPermissions as ModulesPermission) || {};

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

// Exportar o handler de acordo com a estrutura do projeto
// Se estiver usando o diretório 'pages':a
// export default NextAuth(authOptions);

// Se estiver usando o diretório 'app' do Next.js 13, use:
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
