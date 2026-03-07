import { api } from '@/lib/backend-api';
import { normalizeChapter } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapters = await api.get(`/materials/subjects/${id}/chapters`);
    return NextResponse.json({ chapters: (chapters as any[]).map(normalizeChapter) });
  } catch (error) {
    console.error('Failed to fetch chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, is_miscellaneous, order_index } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const chapter = await api.post('/materials/chapters', {
      subjectId: Number(id),
      name,
      description,
      isMiscellaneous: is_miscellaneous,
      orderIndex: order_index,
    });
    return NextResponse.json({ chapter: normalizeChapter(chapter) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
