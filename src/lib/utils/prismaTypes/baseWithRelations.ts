import { Base, Contract } from "@prisma/client";
export type BaseWithRelations = Base & { contract: Contract };
