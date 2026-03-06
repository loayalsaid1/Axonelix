import { RecentMaterialsService } from '@/lib/admin-services/recent-materials-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const materials = await RecentMaterialsService.getRecentMaterials(limit);
    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Failed to fetch recent materials:', error);
    return NextResponse.json({ error: 'Failed to fetch recent materials' }, { status: 500 });
  }
}
