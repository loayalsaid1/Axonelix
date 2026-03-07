import { NextRequest, NextResponse } from 'next/server';
import { ModuleService } from '@/lib/admin-services/module-service';
import { SubjectService } from '@/lib/admin-services/subject-service';
import { ChapterService } from '@/lib/admin-services/chapter-service';

/**
 * Get hierarchy options for dropdowns
 * Supports filtering subjects by module and chapters by subject
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'modules', 'subjects', 'chapters'
    const moduleId = searchParams.get('moduleId');
    const subjectId = searchParams.get('subjectId');

    if (type === 'modules') {
      const modules = await ModuleService.getModules();
      return NextResponse.json({ modules });
    }

    if (type === 'subjects' && moduleId) {
      const subjects = await SubjectService.getSubjectsByModule(moduleId);
      return NextResponse.json({ subjects });
    }

    if (type === 'chapters' && subjectId) {
      const chapters = await ChapterService.getChaptersBySubject(subjectId);
      return NextResponse.json({ chapters });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Failed to fetch hierarchy options:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}
