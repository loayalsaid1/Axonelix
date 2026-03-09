import { ModuleService } from '@/lib/admin-services/module-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const modules = await ModuleService.getModules();
    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, order_index } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const module = await ModuleService.createModule(name, description, order_index);
    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    console.error('Failed to create module:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}
