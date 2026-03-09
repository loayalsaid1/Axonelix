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
