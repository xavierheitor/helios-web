import {
  User,
  UserContractPermission,
  UserModulePermission,
} from "@prisma/client";

export type UserWithRelations = User & {
  contractPermissions?: UserContractPermission[];
  modulePermission?: UserModulePermission[];
};
