export enum Role {
  Student = 'student',
  Admin = 'admin',
}

export interface UserRecord {
  id: number;
  clerkId: string;
  email: string;
  role: Role;
  createdAt: string | null;
  updatedAt: string | null;
}

export type SubjectType = 'theoretical' | 'practical';
export type ExamType = 'final' | 'midterm' | 'tpl' | 'flipped';
export type QuestionType = 'mcq' | 'written';
export type StatementFormat = 'text' | 'tiptap_json';

export interface Module {
  id: string;
  name: string;
  description?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  module_id: string;
  name: string;
  type: SubjectType;
  description?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  description?: string;
  is_miscellaneous: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  name: string;
  description?: string;
  content?: any;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface University {
  id: string;
  name: string;
  created_at?: string;
}

export interface OldExam {
  id: string;
  exam_type: ExamType;
  module_id: string;
  module_type: SubjectType;
  university_id: string;
  year: number;
  created_at?: string;

  // Join properties
  module_name?: string;
  university_name?: string;
}

export interface Question {
  id: string;
  question_type: QuestionType;
  statement: string;
  statement_format: StatementFormat;
  explanation?: any;
  lesson_id?: string;
  chapter_id?: string;
  is_misc: boolean;
  old_exam_id?: string;
  created_at?: string;
  updated_at?: string;

  // Join properties or computed
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  created_at?: string;
}

// UI Types
export type BreadcrumbItem = {
  label: string;
  href: string;
}

export type RecentLesson = {
  lessonId: string;
  lessonTitle: string;
  subjectTitle: string;
  timestamp: Date;
  href: string;
}

// Nested types for API responses if needed
export interface FullModule extends Module {
  subjects: FullSubject[];
}

export interface FullSubject extends Subject {
  chapters: FullChapter[];
}

export interface FullChapter extends Chapter {
  lessons: Lesson[];
  questions?: Question[]; // Misc questions
}
