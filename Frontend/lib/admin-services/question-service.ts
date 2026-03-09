import { sql } from '@vercel/postgres';
import { Question, QuestionOption } from '../types';
import { ChapterService } from './chapter-service';

export type QuestionFilters = { 
  search?: string; 
  lessonId?: string; 
  chapterId?: string;
  chapterIds?: string[]; // Support multiple chapters
  subjectIds?: string[]; // Support multiple subjects
  lessonIds?: string[]; // Support multiple lessons
  oldExamId?: string;
  isMisc?: boolean;
};

export class QuestionService {
  static async getQuestions(filters?: QuestionFilters) {
    const search = filters?.search ? `%${filters.search}%` : null;
    const lessonId = filters?.lessonId || null;
    const chapterId = filters?.chapterId || null;
    const chapterIds = filters?.chapterIds || null;
    const subjectIds = filters?.subjectIds || null;
    const lessonIds = filters?.lessonIds || null;
    const oldExamId = filters?.oldExamId || null;
    const isMisc = filters?.isMisc !== undefined ? filters.isMisc : null;

    // Build the WHERE clause dynamically
    let whereConditions = [];
    let params: any[] = [];

    // Add search condition
    if (search) {
      whereConditions.push(`q.statement ILIKE $${params.length + 1}`);
      params.push(search);
    }

    // Add lesson condition (single lesson for backward compatibility)
    if (lessonId) {
      whereConditions.push(`q.lesson_id = $${params.length + 1}`);
      params.push(lessonId);
    }

    // Hierarchical filtering: lessons > chapters > subjects
    // Use the most specific filter available
    if (lessonIds && lessonIds.length > 0) {
      // Most specific: filter by lessons
      whereConditions.push(`q.lesson_id = ANY($${params.length + 1}::uuid[])`);
      params.push(lessonIds);
    } else if (chapterId) {
      // Single chapter for backward compatibility
      whereConditions.push(`q.chapter_id = $${params.length + 1}`);
      params.push(chapterId);
    } else if (chapterIds && chapterIds.length > 0) {
      // Medium specific: filter by chapters
      whereConditions.push(`q.chapter_id = ANY($${params.length + 1}::uuid[])`);
      params.push(chapterIds);
    } else if (subjectIds && subjectIds.length > 0) {
      // Least specific: filter by subjects (get all chapters in those subjects)
      whereConditions.push(`
        q.chapter_id IN (
          SELECT id FROM chapters WHERE subject_id = ANY($${params.length + 1}::uuid[])
        )
      `);
      params.push(subjectIds);
    }

    // Add old exam condition
    if (oldExamId) {
      whereConditions.push(`q.old_exam_id = $${params.length + 1}`);
      params.push(oldExamId);
    }

    // Add misc condition
    if (isMisc !== null) {
      whereConditions.push(`q.is_misc = $${params.length + 1}`);
      params.push(isMisc);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const query = `
      SELECT q.*, 
             (SELECT json_agg(qo.*) FROM question_options qo WHERE qo.question_id = q.id) as options
      FROM questions q
      ${whereClause}
      ORDER BY q.created_at DESC
    `;

    const result = await sql.query(query, params);
    return result.rows;
  }

  static async getQuestionById(id: string) {
    const result = await sql`
      SELECT q.*, 
             (SELECT json_agg(qo.*) FROM question_options qo WHERE qo.question_id = q.id) as options
      FROM questions q 
      WHERE q.id = ${id}
    `;
    return result.rows[0];
  }

  static async createQuestion(data: {
    question_type: 'mcq' | 'written',
    statement: string,
    statement_format?: 'text' | 'tiptap_json',
    explanation?: any,
    lesson_id?: string,
    chapter_id?: string,
    is_misc?: boolean,
    old_exam_id?: string,
    options?: { option_text: string, is_correct: boolean }[]
  }) {
    const { 
      question_type, statement, statement_format = 'text', 
      explanation, lesson_id, chapter_id, is_misc = false, 
      old_exam_id, options 
    } = data;

    // Use a transaction-like approach if possible, but here we'll do sequential for simplicity with @vercel/postgres
    // Note: In production, use a single client for real transactions
    const result = await sql`
      INSERT INTO questions (
        question_type, statement, statement_format, explanation, 
        lesson_id, chapter_id, is_misc, old_exam_id
      ) 
      VALUES (
        ${question_type}, ${statement}, ${statement_format}, ${JSON.stringify(explanation)}, 
        ${lesson_id || null}, ${chapter_id || null}, ${is_misc}, ${old_exam_id || null}
      )
      RETURNING *
    `;
    
    const newQuestion = result.rows[0];

    if (question_type === 'mcq' && options && options.length > 0) {
      for (const option of options) {
        await sql`
          INSERT INTO question_options (question_id, option_text, is_correct)
          VALUES (${newQuestion.id}, ${option.option_text}, ${option.is_correct})
        `;
      }
    }

    return this.getQuestionById(newQuestion.id);
  }

  static async updateQuestion(id: string, data: {
    question_type?: 'mcq' | 'written',
    statement?: string,
    statement_format?: 'text' | 'tiptap_json',
    explanation?: any,
    lesson_id?: string,
    chapter_id?: string,
    is_misc?: boolean,
    old_exam_id?: string,
    options?: { option_text: string, is_correct: boolean }[]
  }) {
    const { 
      question_type, statement, statement_format, 
      explanation, lesson_id, chapter_id, is_misc, 
      old_exam_id, options 
    } = data;

    // Build update dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (question_type !== undefined) {
      updates.push(`question_type = $${paramIndex++}`);
      values.push(question_type);
    }

    if (statement !== undefined) {
      updates.push(`statement = $${paramIndex++}`);
      values.push(statement);
    }

    if (statement_format !== undefined) {
      updates.push(`statement_format = $${paramIndex++}`);
      values.push(statement_format);
    }

    if (explanation !== undefined) {
      updates.push(`explanation = $${paramIndex++}`);
      values.push(explanation ? JSON.stringify(explanation) : null);
    }

    if ('lesson_id' in data) {
      updates.push(`lesson_id = $${paramIndex++}`);
      values.push(lesson_id || null);
    }

    if ('chapter_id' in data) {
      updates.push(`chapter_id = $${paramIndex++}`);
      values.push(chapter_id || null);
    }

    if (is_misc !== undefined) {
      updates.push(`is_misc = $${paramIndex++}`);
      values.push(is_misc);
    }

    if ('old_exam_id' in data) {
      updates.push(`old_exam_id = $${paramIndex++}`);
      values.push(old_exam_id || null);
    }

    // Always update the timestamp
    updates.push('updated_at = NOW()');

    if (updates.length > 1) { // More than just updated_at
      values.push(id); // Add id at the end for WHERE clause
      const query = `
        UPDATE questions 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `;
      await sql.query(query, values);
    }

    // Handle options update
    if (options !== undefined) {
      // Delete existing options
      await sql`DELETE FROM question_options WHERE question_id = ${id}`;
      
      // Get the current question type (either the new one or fetch existing)
      const currentQuestionType = question_type || (await this.getQuestionById(id))?.question_type;
      
      // Insert new options if it's an MCQ
      if (currentQuestionType === 'mcq' && options.length > 0) {
        for (const option of options) {
          await sql`
            INSERT INTO question_options (question_id, option_text, is_correct)
            VALUES (${id}, ${option.option_text}, ${option.is_correct})
          `;
        }
      }
    }

    return this.getQuestionById(id);
  }

  static async deleteQuestion(id: string) {
    await sql`DELETE FROM questions WHERE id = ${id}`;
  }
}
