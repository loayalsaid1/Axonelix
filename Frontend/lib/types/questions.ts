import { JSONContent } from "@tiptap/core";

export interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

export const QUESTION_TYPES = ["mcq", "written"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type StatementFormat = "text" | "tiptap_json";

export interface Question {
  id: number;
  questionType: QuestionType;
  statement: string;
  statementFormat: StatementFormat;
  explanation: JSONContent | string | null; // TipTap JSON or legacy HTML
  explanationIsLegacyFormat?: boolean;
  isMisc: boolean;
  questionOptions: QuestionOption[];
}

export interface PaginatedQuestionsResponse {
  data: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
