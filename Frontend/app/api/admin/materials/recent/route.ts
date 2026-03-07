import { api } from '@/lib/backend-api';
import { normalizeRecentLesson } from '@/lib/response-transform';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ?? '10';

    const lessons = await api.get(`/materials/lessons/recent?limit=${limit}`);
    const materials = (lessons as any[]).map(normalizeRecentLesson);
    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Failed to fetch recent materials:', error);
    return NextResponse.json({ error: 'Failed to fetch recent materials' }, { status: 500 });
  }
}
