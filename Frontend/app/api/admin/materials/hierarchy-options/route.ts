import { api } from '@/lib/backend-api';
import { normalizeHierarchyOptions } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy to NestJS hierarchy endpoints.
 * All responses are normalized to string IDs and snake_case field names so that
 * shadcn <Select> comparisons and legacy component field access work correctly.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const moduleId = searchParams.get('moduleId');
    const subjectId = searchParams.get('subjectId');

    // Scoped lookups stay on their own NestJS endpoints
    if (type === 'modules') {
      const data = await api.get('/materials/modules/hierarchy-options');
      return NextResponse.json({ modules: normalizeHierarchyOptions(data).modules });
    }

    if (type === 'subjects' && moduleId) {
      const subjects = await api.get(`/materials/subjects?moduleId=${moduleId}`);
      // Return only the fields the select dropdowns need
      const normalized = (subjects as any[]).map((s: any) => ({
        id: String(s.id),
        name: s.name,
        type: s.type,
        module_id: String(s.moduleId ?? s.module_id ?? ''),
      }));
      return NextResponse.json({ subjects: normalized });
    }

    if (type === 'chapters' && subjectId) {
      const chapters = await api.get(`/materials/subjects/${subjectId}/chapters`);
      const normalized = (chapters as any[]).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        subject_id: String(c.subjectId ?? c.subject_id ?? ''),
        is_miscellaneous: c.isMiscellaneous ?? c.is_miscellaneous ?? false,
      }));
      return NextResponse.json({ chapters: normalized });
    }

    // No type → return full flat snapshot for bulk dropdown population
    const data = await api.get('/materials/modules/hierarchy-options');
    return NextResponse.json(normalizeHierarchyOptions(data));
  } catch (error) {
    console.error('Failed to fetch hierarchy options:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}
