import { sql } from '@vercel/postgres';

export class SubjectService {
  static async getSubjectsByModule(moduleId: string) {
    const result = await sql`
      SELECT * FROM subjects 
      WHERE module_id = ${moduleId} 
      ORDER BY order_index ASC, name ASC
    `;
    return result.rows;
  }

  static async getSubjectById(id: string) {
    const result = await sql`SELECT * FROM subjects WHERE id = ${id}`;
    return result.rows[0];
  }

  static async createSubject(moduleId: string, name: string, description: string, type: 'theoretical' | 'practical', orderIndex?: number) {
    const result = await sql`
      INSERT INTO subjects (module_id, name, description, type, order_index) 
      VALUES (${moduleId}, ${name}, ${description}, ${type}, ${orderIndex || 0})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async updateSubject(id: string, name: string, description: string, type: 'theoretical' | 'practical', orderIndex?: number) {
    const result = await sql`
      UPDATE subjects 
      SET name = ${name}, description = ${description}, type = ${type}, order_index = ${orderIndex || 0}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async deleteSubject(id: string) {
    await sql`DELETE FROM subjects WHERE id = ${id}`;
  }
}
