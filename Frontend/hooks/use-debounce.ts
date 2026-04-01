'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of a value.
 */
export function useDebounce<T>(value: T, delay = 350): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [value, delay]);

	return debouncedValue;
}

export default useDebounce;
