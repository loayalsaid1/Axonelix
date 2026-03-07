import { api } from '@/lib/backend-api';
import { normalizeHierarchyOptions } from '@/lib/response-transform';
import { NextResponse } from 'next/server';

// Fetches all modules/subjects/chapters/lessons for cascading filter dropdowns.
// IDs are strings so shadcn Select comparisons work without type coercion.
export async function GET() {
  try {
    const data = await api.get('/materials/modules/hierarchy-options');
    return NextResponse.json(normalizeHierarchyOptions(data));
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}
