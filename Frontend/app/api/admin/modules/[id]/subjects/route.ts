import { api } from '@/lib/backend-api';
import { normalizeSubject } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subjects = await api.get(`/materials/subjects?moduleId=${id}`);
    return NextResponse.json({ subjects: (subjects as any[]).map(normalizeSubject) });
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

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const subject = await api.post('/materials/subjects', {
      moduleId: Number(id),
      name,
      description,
      type,
      orderIndex: order_index,
    });
    return NextResponse.json({ subject: normalizeSubject(subject) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
