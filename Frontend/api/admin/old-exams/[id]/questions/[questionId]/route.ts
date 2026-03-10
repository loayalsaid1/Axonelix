import { OldExamService } from '@/lib/admin-services/old-exam-service';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    await OldExamService.unlinkQuestionFromExam(questionId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unlink question from exam:', error);
    return NextResponse.json(
      { error: 'Failed to unlink question from exam' },
      { status: 500 }
    );
  }
}
