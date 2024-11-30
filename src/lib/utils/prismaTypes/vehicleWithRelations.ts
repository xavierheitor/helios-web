import { Contract, VehicleType } from "@prisma/client";
import { Vehicle } from "./../../../../node_modules/.prisma/client/index.d";
export type VehicleWithRelations = Vehicle & {
  contract: Contract;
  vehicleType: VehicleType;
};
