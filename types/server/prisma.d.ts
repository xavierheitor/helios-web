/* eslint-disable no-var */
// global.d.ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

declare module "@prisma/client" {
  export interface PrismaClient {
    _currentUserId?: number | null;
    softDelete<T extends keyof PrismaClient>(
      model: T,
      where: Record<string, any>
    ): Promise<void>;
  }
}
