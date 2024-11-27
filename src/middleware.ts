import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface Permission {
  href?: string | null;
  canView: boolean;
  [key: string]: any; // Adicione outras propriedades conforme necessário
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Usar a API oficial do NextAuth para obter o token decodificado
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Verificar se o usuário está autenticado
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Extrair permissões do token
  const userPermissions = token.modulesPermissions || {};

  // Permitir acesso ao dashboard principal
  if (pathname === "/dashboard") {
    return NextResponse.next();
  }

  // Verificar permissões para outras rotas dentro de /dashboard
  const permissionForRoute = Object.values(userPermissions).find(
    (perm: Permission) =>
      perm.href && pathname.startsWith(perm.href) && perm.canView
  );

  if (permissionForRoute) {
    return NextResponse.next();
  }

  // Caso o usuário não tenha permissão, redirecionar para uma página de erro 404
  return NextResponse.rewrite(new URL("/not-found", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*"], // Middleware aplicado a rotas dentro de /dashboard
};
