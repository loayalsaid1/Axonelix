import { OldExamService } from '@/lib/admin-services/old-exam-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const universities = await OldExamService.getUniversities();
    return NextResponse.json({ universities });
  } catch (error) {
    console.error('Failed to fetch universities:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const university = await OldExamService.createUniversity(name);
    return NextResponse.json({ university }, { status: 201 });
  } catch (error) {
    console.error('Failed to create university:', error);
    return NextResponse.json({ error: 'Failed to create university' }, { status: 500 });
  }
}
