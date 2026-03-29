import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/constants';

async function getBearerToken(): Promise<string | null> {
	const { getToken } = await auth();
	return getToken();
}

export async function POST(request: NextRequest) {
	try {
		const token = await getBearerToken();

		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = await request.json();

		const response = await fetch(`${API_BASE_URL}/images`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
			cache: 'no-store',
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return NextResponse.json(
				{ error: data?.message ?? 'Failed to record uploaded image' },
				{ status: response.status },
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error('Failed to proxy image record request:', error);
		return NextResponse.json({ error: 'Failed to record uploaded image' }, { status: 500 });
	}
}
