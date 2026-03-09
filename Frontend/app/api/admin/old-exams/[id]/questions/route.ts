import { OldExamService } from '@/lib/admin-services/old-exam-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await OldExamService.getExamQuestions(id);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Failed to fetch exam questions:', error);
    return NextResponse.json({ error: 'Failed to fetch exam questions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { questionId } = await request.json();

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const result = await OldExamService.linkQuestionToExam(questionId, id);
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error('Failed to link question to exam:', error);
    return NextResponse.json(
      { error: 'Failed to link question to exam' },
      { status: 500 }
    );
  }
}
