import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/constants';

async function getBearerToken(): Promise<string | null> {
	const { getToken } = await auth();
	return getToken();
}

export async function GET() {
	try {
		const token = await getBearerToken();

		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const response = await fetch(`${API_BASE_URL}/images/imagekit_auth`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: 'no-store',
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return NextResponse.json(
				{ error: data?.message ?? 'Failed to retrieve ImageKit auth parameters' },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Failed to proxy ImageKit auth request:', error);
		return NextResponse.json({ error: 'Failed to retrieve ImageKit auth parameters' }, { status: 500 });
	}
}
