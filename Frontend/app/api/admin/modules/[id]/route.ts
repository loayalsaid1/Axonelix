import { ModuleService } from '@/lib/admin-services/module-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const module = await ModuleService.getModuleById(id);
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json({ module });
  } catch (error) {
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
    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const module = await ModuleService.updateModule(id, name, description);
    return NextResponse.json({ module });
  } catch (error) {
    console.error('Failed to update module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ModuleService.deleteModule(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}
