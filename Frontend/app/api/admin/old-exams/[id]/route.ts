import { api } from '@/lib/backend-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await api.get(`/questions/old-exams/${id}`);
    return NextResponse.json({ exam });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Old exam not found' }, { status: 404 });
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

    const exam = await api.patch(`/questions/old-exams/${id}`, {
      examType: data.exam_type ?? data.examType,
      moduleId: data.module_id != null ? Number(data.module_id) : data.moduleId,
      moduleType: data.module_type ?? data.moduleType,
      universityId: data.university_id != null ? Number(data.university_id) : data.universityId,
      year: data.year != null ? Number(data.year) : undefined,
    });
    return NextResponse.json({ exam });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Old exam not found' }, { status: 404 });
    console.error('Failed to update old exam:', error);
    return NextResponse.json({ error: 'Failed to update old exam' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await api.delete(`/questions/old-exams/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Old exam not found' }, { status: 404 });
    console.error('Failed to delete old exam:', error);
    return NextResponse.json({ error: 'Failed to delete old exam' }, { status: 500 });
  }
}
