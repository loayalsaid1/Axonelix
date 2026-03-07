import { api } from '@/lib/backend-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const params = new URLSearchParams();

    // Simple scalar params — forwarded directly as NestJS query params
    if (sp.get('lessonId')) params.set('lessonId', sp.get('lessonId')!);
    if (sp.get('chapterId')) params.set('chapterId', sp.get('chapterId')!);
    if (sp.get('oldExamId')) params.set('oldExamId', sp.get('oldExamId')!);
    if (sp.has('isMisc')) params.set('isMisc', sp.get('isMisc')!);

    const qs = params.toString();
    const questions = await api.get(`/questions${qs ? `?${qs}` : ''}`);
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

    // Map snake_case frontend fields to NestJS camelCase DTO
    const question = await api.post('/questions', {
      questionType: data.question_type,
      statement: data.statement,
      statementFormat: data.statement_format,
      explanation: data.explanation,
      lessonId: data.lesson_id ?? data.lessonId,
      chapterId: data.chapter_id ?? data.chapterId,
      isMisc: data.is_misc ?? data.isMisc,
      oldExamId: data.old_exam_id ?? data.oldExamId,
      options: data.options,
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
