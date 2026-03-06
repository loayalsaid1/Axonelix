import { LessonService } from '@/lib/admin-services/lesson-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await LessonService.getLessonById(id);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json({ lesson });
  } catch (error) {
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
    // ✅🙄💡, You know what??>>> I'm keeping this line from gpt 5 mini..
    // accept either camelCase or snake_case for chapter id
    const chapterId = body.chapterId ?? body.chapter_id;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const lesson = await LessonService.updateLesson(
      id,
      name,
      description,
      content || '',
      order_index,
      chapterId,
      subjectId,
      isMisc
    );
    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Failed to update lesson:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await LessonService.deleteLesson(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete lesson:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
