import { Contract, Team, TeamType } from "@prisma/client";

export type TeamWithRelations = Team & {
  contract: Contract;
  teamType: TeamType;
};
