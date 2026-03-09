import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const response = await fetch(`${API_BASE_URL}/materials/lessons/recent?limit=${limit}`);
    if (!response.ok) throw new Error('Upstream error');
    const materials = await response.json();
    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Failed to fetch recent materials:', error);
    return NextResponse.json({ error: 'Failed to fetch recent materials' }, { status: 500 });
  }
}
