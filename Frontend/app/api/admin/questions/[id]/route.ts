import { api } from '@/lib/backend-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await api.get(`/questions/${id}`);
    return NextResponse.json({ question });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    console.error('Failed to fetch question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (data.statement !== undefined && !data.statement) {
      return NextResponse.json({ error: 'Statement cannot be empty' }, { status: 400 });
    }

    if ((data.question_type ?? data.questionType) === 'mcq' && data.options && data.options.length < 2) {
      return NextResponse.json({ error: 'MCQ must have at least 2 options' }, { status: 400 });
    }

    // Map snake_case to camelCase for NestJS DTO
    const question = await api.patch(`/questions/${id}`, {
      questionType: data.question_type ?? data.questionType,
      statement: data.statement,
      statementFormat: data.statement_format ?? data.statementFormat,
      explanation: data.explanation,
      lessonId: data.lesson_id ?? data.lessonId,
      chapterId: data.chapter_id ?? data.chapterId,
      isMisc: data.is_misc ?? data.isMisc,
      oldExamId: data.old_exam_id ?? data.oldExamId,
      options: data.options,
    });

    return NextResponse.json({ question });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    console.error('Failed to update question:', error);
    return NextResponse.json({
      error: 'Failed to update question',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await api.delete(`/questions/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    console.error('Failed to delete question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
