/**
 * General-purpose utility functions for the OpenSpec Status Widget extension.
 */

/**
 * Create a debounced version of a function.
 * The debounced function is called after `delay` ms of inactivity.
 */
export function debounce<Args extends unknown[]>(
	fn: (...args: Args) => void,
	delay: number,
): { (...args: Args): void; cancel(): void; flush(): void } {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let lastArgs: Args | null = null;

	const debounced = (...args: Args) => {
		lastArgs = args;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			lastArgs = null;
			fn(...args);
		}, delay);
	};

	debounced.cancel = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
			lastArgs = null;
		}
	};

	debounced.flush = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
			const args = lastArgs;
			lastArgs = null;
			if (args) fn(...args);
		}
	};

	return debounced;
}

/**
 * Check if two string arrays have identical content.
 */
export function arraysEqual(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
