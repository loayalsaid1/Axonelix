import { ChapterService } from '@/lib/admin-services/chapter-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapter = await ChapterService.getChapterById(id);
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    return NextResponse.json({ chapter });
  } catch (error) {
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

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const chapter = await ChapterService.updateChapter(id, name, description, is_miscellaneous, order_index);
    return NextResponse.json({ chapter });
  } catch (error) {
    console.error('Failed to update chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ChapterService.deleteChapter(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
