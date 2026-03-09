import { QuestionService } from '@/lib/admin-services/question-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const lessonId = searchParams.get('lessonId') || '';
    const chapterId = searchParams.get('chapterId') || '';
    const chapterIds = searchParams.get('chapterIds') || '';
    const subjectIds = searchParams.get('subjectIds') || '';
    const lessonIds = searchParams.get('lessonIds') || '';
    const oldExamId = searchParams.get('oldExamId') || '';
    const isMisc = searchParams.get('isMisc') === 'true';

    // Parse chapterIds if provided (comma-separated)
    const chapterIdsArray = chapterIds
      ? chapterIds.split(',').filter(id => id.trim())
      : undefined;

    // Parse subjectIds if provided (comma-separated)
    const subjectIdsArray = subjectIds
      ? subjectIds.split(',').filter(id => id.trim())
      : undefined;

    // Parse lessonIds if provided (comma-separated)
    const lessonIdsArray = lessonIds
      ? lessonIds.split(',').filter(id => id.trim())
      : undefined;

    const questions = await QuestionService.getQuestions({
      search: search || undefined,
      lessonId: lessonId || undefined,
      chapterId: chapterId || undefined,
      chapterIds: chapterIdsArray,
      subjectIds: subjectIdsArray,
      lessonIds: lessonIdsArray,
      oldExamId: oldExamId || undefined,
      isMisc: searchParams.has('isMisc') ? isMisc : undefined,
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.statement || !data.question_type) {
      return NextResponse.json(
        { error: 'Statement and question type are required' },
        { status: 400 }
      );
    }

    const newQuestion = await QuestionService.createQuestion(data);
    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
