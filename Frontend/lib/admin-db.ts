import { ModuleService } from './admin-services/module-service';
import { SubjectService } from './admin-services/subject-service';
import { ChapterService } from './admin-services/chapter-service';
import { LessonService } from './admin-services/lesson-service';
import { QuestionService, QuestionFilters } from './admin-services/question-service';
import { OldExamService } from './admin-services/old-exam-service';
import { RecentMaterialsService } from './admin-services/recent-materials-service';
export type { RecentMaterial } from './admin-services/recent-materials-service';

// Modules
export const getModules = ModuleService.getModules;
export const getModuleById = ModuleService.getModuleById;
export const createModule = ModuleService.createModule;
export const updateModule = ModuleService.updateModule;
export const deleteModule = ModuleService.deleteModule;

// Subjects
export const getSubjectsByModule = SubjectService.getSubjectsByModule;
export const getSubjectById = SubjectService.getSubjectById;
export const createSubject = SubjectService.createSubject;
export const updateSubject = SubjectService.updateSubject;
export const deleteSubject = SubjectService.deleteSubject;

// Chapters
export const getChaptersBySubject = ChapterService.getChaptersBySubject;
export const getChapterById = ChapterService.getChapterById;
export const createChapter = ChapterService.createChapter;
export const updateChapter = ChapterService.updateChapter;
export const deleteChapter = ChapterService.deleteChapter;

// Lessons
export const getLessonsByChapter = LessonService.getLessonsByChapter;
export const getLessonById = LessonService.getLessonById;
export const createLesson = LessonService.createLesson;
export const updateLesson = LessonService.updateLesson;
export const deleteLesson = LessonService.deleteLesson;

// Questions
export type { QuestionFilters };
export const getQuestions = QuestionService.getQuestions;
export const getQuestionById = QuestionService.getQuestionById;
export const createQuestion = QuestionService.createQuestion;
export const updateQuestion = QuestionService.updateQuestion;
export const deleteQuestion = QuestionService.deleteQuestion;

// Old Exams
export const getOldExams = OldExamService.getOldExams;
export const getOldExamById = OldExamService.getOldExamById;
export const createOldExam = OldExamService.createOldExam;
export const linkQuestionToExam = OldExamService.linkQuestionToExam;
export const unlinkQuestionFromExam = OldExamService.unlinkQuestionFromExam;
export const getExamQuestions = OldExamService.getExamQuestions;

// Recent Materials
export const buildMaterialUrl = RecentMaterialsService.buildMaterialUrl;
export const getMaterialBreadcrumb = RecentMaterialsService.getMaterialBreadcrumb;
