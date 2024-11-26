import { Contract, UserContractPermission } from "@prisma/client";
export type UserContractPermissionWithRelations = UserContractPermission & {
  contract?: Contract;
};
