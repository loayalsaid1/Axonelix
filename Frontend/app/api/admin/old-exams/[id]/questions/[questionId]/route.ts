import { api } from '@/lib/backend-api';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;
    // Unlink by clearing the oldExamId on the question
    await api.patch(`/questions/${questionId}`, { oldExamId: null });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    console.error('Failed to unlink question from exam:', error);
    return NextResponse.json({ error: 'Failed to unlink question from exam' }, { status: 500 });
  }
}
