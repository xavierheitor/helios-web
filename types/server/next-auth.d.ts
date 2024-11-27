// types/next-auth.d.ts

import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

type modulesPermission = Record<
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

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    name?: string | null;
    username: string;
    email?: string | null;

    modulesPermissions?: modulesPermission;
    allowedContratos?: number[];
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      username: string;

      modulesPermissions?: modulesPermission;
      allowedContratos?: number[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    email?: string | null;

    modulesPermissions?: modulesPermission;
    allowedContratos?: number[];
  }
}
