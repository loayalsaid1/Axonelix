import { sql } from '@vercel/postgres';

export class ModuleService {
  static async getModules() {
    const result = await sql`SELECT * FROM modules ORDER BY order_index ASC, name ASC`;
    return result.rows;
  }

  static async getModuleById(id: string) {
    const result = await sql`SELECT * FROM modules WHERE id = ${id}`;
    return result.rows[0];
  }

  static async createModule(name: string, description: string, orderIndex?: number) {
    const result = await sql`
      INSERT INTO modules (name, description, order_index) 
      VALUES (${name}, ${description}, ${orderIndex || 0})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async updateModule(id: string, name: string, description: string, orderIndex?: number) {
    const result = await sql`
      UPDATE modules 
      SET name = ${name}, description = ${description}, order_index = ${orderIndex || 0}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async deleteModule(id: string) {
    await sql`DELETE FROM modules WHERE id = ${id}`;
  }
}
