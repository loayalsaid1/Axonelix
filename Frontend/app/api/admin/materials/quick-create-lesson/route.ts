import { api } from '@/lib/backend-api';
import { normalizeLesson } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lessonName,
      lessonDescription,
      lessonContent,
      moduleId,
      subjectId,
      chapterId,
      orderIndex,
      isMisc,
    } = body;

    if (!lessonName) {
      return NextResponse.json({ error: 'Lesson name is required' }, { status: 400 });
    }

    if (!moduleId || !subjectId || (!chapterId && !isMisc)) {
      return NextResponse.json(
        { error: 'Module, subject, and chapter (or isMisc) are required' },
        { status: 400 }
      );
    }

    const lesson = await api.post('/materials/lessons', {
      chapterId: chapterId ? Number(chapterId) : undefined,
      subjectId: Number(subjectId),
      isMisc,
      name: lessonName,
      description: lessonDescription ?? '',
      content: lessonContent ?? {},
      orderIndex: orderIndex ?? 0,
    });

    return NextResponse.json({
      lesson: normalizeLesson(lesson),
      hierarchy: { moduleId, subjectId, chapterId },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to quick create lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
