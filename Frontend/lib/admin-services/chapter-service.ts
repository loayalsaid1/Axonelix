import { sql } from '@vercel/postgres';

export class ChapterService {
  static async getChaptersBySubject(subjectId: string) {
    const result = await sql`
      SELECT * FROM chapters 
      WHERE subject_id = ${subjectId} 
      ORDER BY order_index ASC, name ASC
    `;
    return result.rows;
  }

  static async getChapterById(id: string) {
    const result = await sql`SELECT * FROM chapters WHERE id = ${id}`;
    return result.rows[0];
  }

  static async createChapter(subjectId: string, name: string, description: string, isMiscellaneous: boolean = false, orderIndex?: number) {
    const result = await sql`
      INSERT INTO chapters (subject_id, name, description, is_miscellaneous, order_index) 
      VALUES (${subjectId}, ${name}, ${description}, ${isMiscellaneous}, ${orderIndex || 0})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async updateChapter(id: string, name: string, description: string, isMiscellaneous: boolean = false, orderIndex?: number) {
    const result = await sql`
      UPDATE chapters 
      SET name = ${name}, description = ${description}, is_miscellaneous = ${isMiscellaneous}, order_index = ${orderIndex || 0}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async deleteChapter(id: string) {
    await sql`DELETE FROM chapters WHERE id = ${id}`;
  }

  static async getOrCreateMiscellaneousChapter(subjectId: string) {
    // Check if a miscellaneous chapter already exists for this subject
    const existing = await sql`
      SELECT * FROM chapters 
      WHERE subject_id = ${subjectId} AND is_miscellaneous = TRUE 
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Create a new one if it doesn't exist
    return this.createChapter(
      subjectId,
      'Miscellaneous',
      'Lessons and questions that do not belong to a specific chapter',
      true,
      999 // Put it at the end
    );
  }
}
