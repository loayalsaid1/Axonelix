import { SubjectService } from '@/lib/admin-services/subject-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subject = await SubjectService.getSubjectById(id);
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json({ subject });
  } catch (error) {
    console.error('Failed to fetch subject:', error);
    return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, type, order_index } = await request.json();

    if (!name || !description || !type) {
      return NextResponse.json(
        { error: 'Name, description and type are required' },
        { status: 400 }
      );
    }

    const subject = await SubjectService.updateSubject(id, name, description, type, order_index);
    return NextResponse.json({ subject });
  } catch (error) {
    console.error('Failed to update subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await SubjectService.deleteSubject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
