import { api } from '@/lib/backend-api';
import { normalizeChapter } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapter = await api.get(`/materials/chapters/${id}`);
    return NextResponse.json({ chapter: normalizeChapter(chapter) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, is_miscellaneous, order_index } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const chapter = await api.patch(`/materials/chapters/${id}`, {
      name,
      description,
      isMiscellaneous: is_miscellaneous,
      orderIndex: order_index,
    });
    return NextResponse.json({ chapter: normalizeChapter(chapter) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    console.error('Failed to update chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await api.delete(`/materials/chapters/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    console.error('Failed to delete chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
