import { api } from '@/lib/backend-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Fetch questions filtered by this old exam
    const questions = await api.get(`/questions?oldExamId=${id}`);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Failed to fetch exam questions:', error);
    return NextResponse.json({ error: 'Failed to fetch exam questions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { questionId } = await request.json();

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Link existing question to exam by patching its oldExamId
    const result = await api.patch(`/questions/${questionId}`, {
      oldExamId: Number(id),
    });
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error('Failed to link question to exam:', error);
    return NextResponse.json({ error: 'Failed to link question to exam' }, { status: 500 });
  }
}
