import {  ChecklistType, Question } from "@prisma/client";

export type QuestionWithRelations = Question & {
  checklistType: ChecklistType;
};
