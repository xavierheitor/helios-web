import { Employee, Role } from "@prisma/client";
export type EmployeeWithRelations = Employee & {
  role: Role;
};
