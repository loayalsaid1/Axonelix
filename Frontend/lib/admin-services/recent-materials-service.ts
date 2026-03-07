import { sql } from '@vercel/postgres';

export interface RecentMaterial {
  id: string;
  name: string;
  type: 'module' | 'subject' | 'chapter' | 'lesson';
  description?: string;
  updated_at: string;
  created_at: string;
  // Additional context for navigation
  module_id?: string;
  module_name?: string;
  subject_id?: string;
  subject_name?: string;
  chapter_id?: string;
  chapter_name?: string;
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
        return `/admin/materials/${material.module_id}/${material.id}`;
      case 'chapter':
        return `/admin/materials/${material.module_id}/${material.subject_id}/${material.id}`;
      case 'lesson':
        return `/admin/lessons/${material.id}`;
      default:
        return '/admin/materials';
    }
  }

  /**
   * Get breadcrumb text for a material
   */
  static getMaterialBreadcrumb(material: RecentMaterial): string {
    const parts: string[] = [];
    
    if (material.module_name) parts.push(material.module_name);
    if (material.subject_name) parts.push(material.subject_name);
    if (material.chapter_name) parts.push(material.chapter_name);
    
    return parts.join(' › ');
  }
}
