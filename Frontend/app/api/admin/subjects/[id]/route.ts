import { api } from '@/lib/backend-api';
import { normalizeSubject } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subject = await api.get(`/materials/subjects/${id}`);
    return NextResponse.json({ subject: normalizeSubject(subject) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
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

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const subject = await api.patch(`/materials/subjects/${id}`, {
      name,
      description,
      type,
      orderIndex: order_index,
    });
    return NextResponse.json({ subject: normalizeSubject(subject) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    console.error('Failed to update subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await api.delete(`/materials/subjects/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    console.error('Failed to delete subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
