import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Axonelix Medical Hub',
		short_name: 'Axonelix',
		description: 'A comprehensive platform for medical students to access study materials, practice questions, and track their performance.',
		start_url: '/dashboard',
		display: 'standalone',
		background_color: '#020617',
		theme_color: '#f8fafc',
		icons: [
			{
				src: '/icon-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/icon-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
	}
}
