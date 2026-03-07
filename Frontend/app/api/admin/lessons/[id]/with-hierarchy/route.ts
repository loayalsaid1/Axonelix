import { api } from '@/lib/backend-api';
import { normalizeLessonWithHierarchy } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

// NestJS GET /materials/lessons/:id returns the lesson with nested chapter/subject/module.
// We flatten it to the snake_case shape expected by the lesson edit page.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await api.get(`/materials/lessons/${id}`);
    return NextResponse.json({ lesson: normalizeLessonWithHierarchy(lesson) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    console.error('Failed to fetch lesson with hierarchy:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}
