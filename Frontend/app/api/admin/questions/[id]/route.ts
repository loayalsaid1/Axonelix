import { QuestionService } from '@/lib/admin-services/question-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await QuestionService.getQuestionById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json({ question });
  } catch (error) {
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

    // Basic validation
    if (data.statement !== undefined && !data.statement) {
      return NextResponse.json({ error: 'Statement cannot be empty' }, { status: 400 });
    }

    if (data.question_type === 'mcq' && data.options && data.options.length < 2) {
      return NextResponse.json({ error: 'MCQ must have at least 2 options' }, { status: 400 });
    }

    const updatedQuestion = await QuestionService.updateQuestion(id, data);

    if (!updatedQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error('Failed to update question:', error);
    return NextResponse.json({
      error: 'Failed to update question',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await QuestionService.deleteQuestion(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
