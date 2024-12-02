import {
  Checklist,
  ChecklistType,
  ChecklistAssociatedQuestion,
  Question,
} from "@prisma/client";

export type ChecklistWithRelations = Checklist & {
  checklistType: ChecklistType;
  associatedQuestions: (ChecklistAssociatedQuestion & {
    question: Question;
  })[];
};
