
export interface LabValue {
  parameter: string;
  result: string;
  referenceRange: string;
  isAbnormal?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: number;
  stem: string;
  leadIn: string;
  labData?: LabValue[];
  options: QuestionOption[];
  status: 'current' | 'answered' | 'unseen' | 'flagged';
}

export interface Subject {
  id: string;
  name: string;
  progress: number;
  totalQuestions: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  subtopics: string[];
}

export type ViewType = 'dashboard' | 'qbank' | 'library';
