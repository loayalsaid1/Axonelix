import { api } from '@/lib/backend-api';
import { normalizeModule } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const modules = await api.get('/materials/modules');
    return NextResponse.json({ modules: (modules as any[]).map(normalizeModule) });
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, order_index } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const module = await api.post('/materials/modules', {
      name,
      description,
      orderIndex: order_index,
    });
    return NextResponse.json({ module: normalizeModule(module) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create module:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}
