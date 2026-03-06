import { OldExamService } from '@/lib/admin-services/old-exam-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const exams = await OldExamService.getOldExams();
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
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const exam = await OldExamService.createOldExam(data);
    return NextResponse.json({ exam }, { status: 201 });
  } catch (error) {
    console.error('Failed to create old exam:', error);
    return NextResponse.json({ error: 'Failed to create old exam' }, { status: 500 });
  }
}
