import { sql } from "@vercel/postgres";

export interface RecentMaterial {
  id: string;
  name: string;
  type: 'module' | 'subject' | 'chapter' | 'lesson';
  description?: string;
  updatedAt: string;
  createdAt: string;
  // Additional context for navigation
  moduleId?: string;
  moduleName?: string;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterName?: string;
}

export class RecentMaterialsService {
  /**
 * Get recently edited lessons
 * @param limit - Number of items to return (default: 10)
 */
  static async getRecentMaterials(limit: number = 10): Promise<RecentMaterial[]> {
    try {
      // Get recent lessons with full hierarchy info
      const lessonsResult = await sql`
        SELECT 
          l.id, 
          l.name, 
          l.description,
          'lesson' as type,
          l.updated_at,
          l.created_at,
          s.module_id,
          m.name as module_name,
          c.subject_id,
          s.name as subject_name,
          l.chapter_id,
          c.name as chapter_name
        FROM lessons l
        JOIN chapters c ON l.chapter_id = c.id
        JOIN subjects s ON c.subject_id = s.id
        JOIN modules m ON s.module_id = m.id
        ORDER BY l.updated_at DESC
        LIMIT ${limit}
      `;

      return lessonsResult.rows as RecentMaterial[];
    } catch (error) {
      console.error('Failed to fetch recent lessons:', error);
      throw error;
    }
  }

  /**
   * Build navigation URL for a material
   */
  static buildMaterialUrl(material: RecentMaterial): string {
    switch (material.type) {
      case 'module':
        return `/admin/materials/${material.id}`;
      case 'subject':
        return `/admin/materials/${material.moduleId}/${material.id}`;
      case 'chapter':
        return `/admin/materials/${material.moduleId}/${material.subjectId}/${material.id}`;
      case 'lesson':
        return `/admin/lessons/${material.id}`;
      default:
        return '/admin/materials';
    }
  }

  static getMaterialBreadcrumb(material: RecentMaterial): string {
    const parts: string[] = [];

    if (material.moduleName) parts.push(material.moduleName);
    if (material.subjectName) parts.push(material.subjectName);
    if (material.chapterName) parts.push(material.chapterName);

    return parts.join(' › ');
  }
}
