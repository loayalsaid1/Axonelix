import { OldExamService } from '@/lib/admin-services/old-exam-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await OldExamService.getOldExamById(id);
    if (!exam) {
      return NextResponse.json({ error: 'Old exam not found' }, { status: 404 });
    }
    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Failed to fetch old exam:', error);
    return NextResponse.json({ error: 'Failed to fetch old exam' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const exam = await OldExamService.updateOldExam(id, data);
    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Failed to update old exam:', error);
    return NextResponse.json({ error: 'Failed to update old exam' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await OldExamService.deleteOldExam(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete old exam:', error);
    return NextResponse.json({ error: 'Failed to delete old exam' }, { status: 500 });
  }
}
