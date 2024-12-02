// src/lib/utils/prismaTypes/deviceWithPermissions.ts
import { Device, DeviceContractPermissions } from "@prisma/client";

export interface DeviceWithPermissions extends Device {
  DeviceContractPermissions: DeviceContractPermissions[];
}
