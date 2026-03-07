import { api } from '@/lib/backend-api';
import { normalizeModule } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const module = await api.get(`/materials/modules/${id}`);
    return NextResponse.json({ module: normalizeModule(module) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    console.error('Failed to fetch module:', error);
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, order_index } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const module = await api.patch(`/materials/modules/${id}`, {
      name,
      description,
      orderIndex: order_index,
    });
    return NextResponse.json({ module: normalizeModule(module) });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    console.error('Failed to update module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await api.delete(`/materials/modules/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 404) return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    console.error('Failed to delete module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}
