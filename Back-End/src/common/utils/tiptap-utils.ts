/**
 * Core utility to extract image URLs from a TipTap JSON object.
 * This is an independent, pure function with no side-effects or dependencies.
 * 
 * @param node The TipTap JSON node or document
 * @returns An array of string URLs found in `image` nodes
 */
export function extractImageUrls(node: any): string[] {
	if (!node) {
		return [];
	}

	if (typeof node === 'string') {
		try {
			node = JSON.parse(node);
		} catch (e) {
			return [];
		}
	}

	if (typeof node !== 'object') {
		return [];
	}

	const urls: string[] = [];

	// If this is an image node with a src attribute, capture it
	if (node.type === 'image' && node.attrs && typeof node.attrs.src === 'string') {
		urls.push(node.attrs.src);
	}

	// If this node has content, traverse recursively
	if (Array.isArray(node.content)) {
		for (const childNode of node.content) {
			urls.push(...extractImageUrls(childNode));
		}
	}

	// Additionally, some extensions might nest nodes in 'marks' or other arrays, 
	// though standard TipTap uses 'content'. We ensure robust traversal if needed.
	// But standard image nodes are block/inline nodes in 'content'.

	// Ensure we only return unique URLs
	return Array.from(new Set(urls));
}
