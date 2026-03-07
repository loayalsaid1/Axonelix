import { api } from '@/lib/backend-api';
import { normalizeLesson } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessons = await api.get(`/materials/chapters/${id}/lessons`);
    return NextResponse.json({ lessons: (lessons as any[]).map(normalizeLesson) });
  } catch (error) {
    console.error('Failed to fetch lessons:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, content, order_index } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const lesson = await api.post('/materials/lessons', {
      chapterId: Number(id),
      name,
      description,
      content: content || {},
      orderIndex: order_index,
    });
    return NextResponse.json({ lesson: normalizeLesson(lesson) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lesson:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
