import {
  User,
  UserContractPermission,
  UserMenuPermission,
  UserModulePermission,
} from "@prisma/client";

export type UserWithRelations = User & {
  contractPermissions?: UserContractPermission[];
  menuPermissions?: UserMenuPermission[];
  modulePermission?: UserModulePermission[];
};
