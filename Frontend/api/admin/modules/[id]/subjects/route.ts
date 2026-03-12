import { SubjectService } from '@/lib/admin-services/subject-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subjects = await SubjectService.getSubjectsByModule(id);
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(
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

    const subject = await SubjectService.createSubject(id, name, description, type, order_index);
    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error('Failed to create subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
