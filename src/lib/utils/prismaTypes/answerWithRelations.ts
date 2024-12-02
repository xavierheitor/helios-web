import { Answer, ChecklistType } from "@prisma/client";

export type AnswerWithRelations = Answer & {
  checklistType: ChecklistType;
};
