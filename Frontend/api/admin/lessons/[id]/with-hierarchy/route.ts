import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch lesson with full hierarchy information
    const result = await sql`
      SELECT 
        l.*,
        c.subject_id,
        c.is_miscellaneous,
        s.module_id,
        m.name as module_name,
        s.name as subject_name,
        c.name as chapter_name
      FROM lessons l
      JOIN chapters c ON l.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      JOIN modules m ON s.module_id = m.id
      WHERE l.id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error('Failed to fetch lesson with hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}
