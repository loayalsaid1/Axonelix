import { NextRequest, NextResponse } from 'next/server';
import { LessonService } from '@/lib/admin-services/lesson-service';

/**
 * Quick create lesson endpoint
 * Creates a lesson in existing hierarchy (module, subject, chapter)
 */
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

    // Create lesson
    const lesson = await LessonService.createLesson(
      chapterId || null,
      lessonName,
      lessonDescription || '',
      lessonContent || {},
      orderIndex || 0,
      subjectId,
      isMisc
    );

    return NextResponse.json({
      lesson,
      hierarchy: {
        moduleId,
        subjectId,
        chapterId,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to quick create lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
