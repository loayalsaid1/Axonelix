import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/admin/questions/filter-options
 * Returns available filter options for questions including modules, subjects, and chapters
 */
export async function GET() {
  try {
    // Fetch all modules
    const modulesResult = await sql`
      SELECT id, name 
      FROM modules 
      ORDER BY name ASC
    `;

    // Fetch all subjects with their module info
    const subjectsResult = await sql`
      SELECT id, name, type, module_id 
      FROM subjects 
      ORDER BY name ASC
    `;

    // Fetch all chapters with their subject info
    const chaptersResult = await sql`
      SELECT id, name, subject_id 
      FROM chapters 
      ORDER BY name ASC
    `;

    // Fetch all lessons with their chapter info
    const lessonsResult = await sql`
      SELECT id, name, chapter_id 
      FROM lessons 
      ORDER BY name ASC
    `;

    return NextResponse.json({
      modules: modulesResult.rows,
      subjects: subjectsResult.rows,
      chapters: chaptersResult.rows,
      lessons: lessonsResult.rows,
    });
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
