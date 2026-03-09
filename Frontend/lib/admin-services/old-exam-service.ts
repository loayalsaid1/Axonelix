import { sql } from '@vercel/postgres';
import { ExamType, SubjectType } from '../types';

export class OldExamService {
  static async getOldExams() {
    const result = await sql`
      SELECT oe.*, m.name as module_name, u.name as university_name 
      FROM old_exams oe
      JOIN modules m ON oe.module_id = m.id
      JOIN universities u ON oe.university_id = u.id
      ORDER BY oe.year DESC, oe.created_at DESC
    `;
    return result.rows;
  }

  static async getOldExamById(id: string) {
    const result = await sql`
      SELECT oe.*, m.name as module_name, u.name as university_name 
      FROM old_exams oe
      JOIN modules m ON oe.module_id = m.id
      JOIN universities u ON oe.university_id = u.id
      WHERE oe.id = ${id}
    `;
    return result.rows[0];
  }

  static async createOldExam(data: {
    exam_type: ExamType,
    module_id: string,
    module_type: SubjectType,
    university_id: string,
    year: number
  }) {
    const { exam_type, module_id, module_type, university_id, year } = data;
    const result = await sql`
      INSERT INTO old_exams (exam_type, module_id, module_type, university_id, year) 
      VALUES (${exam_type}, ${module_id}, ${module_type}, ${university_id}, ${year})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async updateOldExam(id: string, data: {
    exam_type?: ExamType,
    module_id?: string,
    module_type?: SubjectType,
    university_id?: string,
    year?: number
  }) {
    const { exam_type, module_id, module_type, university_id, year } = data;
    const result = await sql`
      UPDATE old_exams 
      SET 
        exam_type = COALESCE(${exam_type}, exam_type),
        module_id = COALESCE(${module_id}, module_id),
        module_type = COALESCE(${module_type}, module_type),
        university_id = COALESCE(${university_id}, university_id),
        year = COALESCE(${year}, year)
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async deleteOldExam(id: string) {
    await sql`DELETE FROM old_exams WHERE id = ${id}`;
  }

  // University methods
  static async getUniversities() {
    const result = await sql`SELECT * FROM universities ORDER BY name ASC`;
    return result.rows;
  }

  static async createUniversity(name: string) {
    const result = await sql`INSERT INTO universities (name) VALUES (${name}) RETURNING *`;
    return result.rows[0];
  }

  // Questions in exam
  static async linkQuestionToExam(questionId: string, examId: string) {
    const result = await sql`
      UPDATE questions 
      SET old_exam_id = ${examId} 
      WHERE id = ${questionId}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async unlinkQuestionFromExam(questionId: string, examId: string) {
    const result = await sql`
      UPDATE questions 
      SET old_exam_id = NULL 
      WHERE id = ${questionId} AND old_exam_id = ${examId}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async getExamQuestions(examId: string) {
    const result = await sql`
      SELECT q.*, 
             (SELECT json_agg(qo.*) FROM question_options qo WHERE qo.question_id = q.id) as options
      FROM questions q
      WHERE q.old_exam_id = ${examId}
      ORDER BY q.created_at ASC
    `;
    return result.rows;
  }
}
