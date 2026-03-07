import { api } from '@/lib/backend-api';
import { normalizeLessonWithHierarchy } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

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
    console.error('Failed to fetch lesson:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, content, order_index, subjectId, isMisc } = body;
    const chapterId = body.chapterId ?? body.chapter_id;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await api.patch(`/materials/lessons/${id}`, {
      name,
      description,
      content: content ?? {},
      orderIndex: order_index,
      chapterId: chapterId ? Number(chapterId) : undefined,
      subjectId: subjectId ? Number(subjectId) : undefined,
      isMisc,
    });

    // Re-fetch the lesson so we can return the full hierarchy (PATCH only returns the base row)
    const lesson = await api.get(`/materials/lessons/${id}`);
    return NextResponse.json({ lesson: normalizeLessonWithHierarchy(lesson) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    console.error('Failed to update lesson:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await api.delete(`/materials/lessons/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    console.error('Failed to delete lesson:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
