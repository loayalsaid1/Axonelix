import { api } from '@/lib/backend-api';
import { normalizeLesson } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { chapterId, name, description, content, order_index, subjectId, isMisc } = data;

    if (!name || (!chapterId && !isMisc)) {
      return NextResponse.json(
        { error: 'Name and either chapterId or isMisc=true are required' },
        { status: 400 }
      );
    }

    const lesson = await api.post('/materials/lessons', {
      chapterId: chapterId ? Number(chapterId) : undefined,
      subjectId: subjectId ? Number(subjectId) : undefined,
      isMisc,
      name,
      description,
      content: content ?? {},
      orderIndex: order_index,
    });

    return NextResponse.json({ lesson: normalizeLesson(lesson) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lesson:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
