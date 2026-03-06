import { LessonService } from '@/lib/admin-services/lesson-service';
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

    const newLesson = await LessonService.createLesson(
      chapterId || null,
      name,
      description,
      content,
      order_index,
      subjectId,
      isMisc
    );

    return NextResponse.json({ lesson: newLesson }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lesson:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
