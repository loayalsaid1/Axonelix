import { sql } from '@vercel/postgres';
import { ChapterService } from './chapter-service';

export class LessonService {
  static async getLessonsByChapter(chapterId: string) {
    const result = await sql`
      SELECT * FROM lessons 
      WHERE chapter_id = ${chapterId} 
      ORDER BY order_index ASC, name ASC
    `;
    return result.rows;
  }

  static async getLessonById(id: string) {
    const result = await sql`SELECT * FROM lessons WHERE id = ${id}`;
    return result.rows[0];
  }

  static async createLesson(
    chapterId: string | null, 
    name: string, 
    description: string, 
    content: any, 
    orderIndex?: number,
    subjectId?: string,
    isMisc?: boolean
  ) {
    let targetChapterId = chapterId;

    if (!targetChapterId && isMisc && subjectId) {
      const miscChapter = await ChapterService.getOrCreateMiscellaneousChapter(subjectId);
      targetChapterId = miscChapter.id;
    }

    if (!targetChapterId) {
      throw new Error('Chapter ID is required for non-miscellaneous lessons, or subject ID is required for miscellaneous lessons');
    }

    const result = await sql`
      INSERT INTO lessons (chapter_id, name, description, content, order_index) 
      VALUES (${targetChapterId}, ${name}, ${description}, ${JSON.stringify(content)}, ${orderIndex || 0})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async updateLesson(
    id: string,
    name: string,
    description: string,
    content: any,
    orderIndex?: number,
    chapterId?: string,
    subjectId?: string,
    isMisc?: boolean
  ) {
    let targetChapterId = chapterId;

    if (!targetChapterId && isMisc && subjectId) {
      const miscChapter = await ChapterService.getOrCreateMiscellaneousChapter(subjectId);
      targetChapterId = miscChapter.id;
    }

    let updated;

    if (targetChapterId) {
      updated = await sql`
        UPDATE lessons
        SET name = ${name}, description = ${description}, content = ${JSON.stringify(content)}, order_index = ${orderIndex || 0}, chapter_id = ${targetChapterId}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      updated = await sql`
        UPDATE lessons
        SET name = ${name}, description = ${description}, content = ${JSON.stringify(content)}, order_index = ${orderIndex || 0}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    }

    // Fetch joined hierarchy fields to return canonical names for breadcrumbs
    const result = await sql`
      SELECT 
        l.*,
        c.subject_id,
        c.is_miscellaneous,
        s.module_id,
        m.name as module_name,
        s.name as subject_name,
        c.name as chapter_name
      FROM lessons l
      JOIN chapters c ON l.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      JOIN modules m ON s.module_id = m.id
      WHERE l.id = ${id}
    `;

    return result.rows[0];
  }

  static async deleteLesson(id: string) {
    await sql`DELETE FROM lessons WHERE id = ${id}`;
  }
}
