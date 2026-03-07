import { api } from '@/lib/backend-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const exams = await api.get('/questions/old-exams');
    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Failed to fetch old exams:', error);
    return NextResponse.json({ error: 'Failed to fetch old exams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { exam_type, module_id, module_type, university_id, year } = data;

    if (!exam_type || !module_id || !module_type || !university_id || !year) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const exam = await api.post('/questions/old-exams', {
      examType: exam_type,
      moduleId: Number(module_id),
      moduleType: module_type,
      universityId: Number(university_id),
      year: Number(year),
    });
    return NextResponse.json({ exam }, { status: 201 });
  } catch (error) {
    console.error('Failed to create old exam:', error);
    return NextResponse.json({ error: 'Failed to create old exam' }, { status: 500 });
  }
}
