import type { RigConfig } from '$lib/types';
/**
 * Calculate which item should win based on rigging config
 */
export function selectWinner(items: string[], config: RigConfig): string {
	if (config.enabled && config.targetId !== undefined) {
		// Force specific item to win
		console.log('Rigging enabled. Target ID:', config.targetId);
		const target = items[config.targetId];
		if (target) return target;
	}

	// Pure random
	return items[Math.floor(Math.random() * items.length)];
}

/**
 * Calculate the exact rotation needed to land on a specific item
 * Pointer is at top (270° in SVG coordinate space)
 */
export function calculateTargetRotation(
	currentItem: string,
	items: string[],
	currentRotation: number,
	minSpins = 5,
	maxSpins = 8
): number {
	const targetIndex = items.length - items.indexOf(currentItem) - 1;
	if (targetIndex === -1) return currentRotation + 360 * minSpins;

	const sliceAngle = 360 / items.length;
	// Center of the target slice
	const targetCenterAngle = targetIndex * sliceAngle + Math.random() * sliceAngle;

	// Add random full spins for drama
	const spins = minSpins + Math.round(Math.random() * (maxSpins - minSpins));
	const fullRotations = spins * 360;

	// Calculate final rotation
	const currentNormalized = currentRotation % 360;
	const additionalRotation = (360 - currentNormalized + targetCenterAngle) % 360;

	return currentRotation + fullRotations + additionalRotation;
}

/**
 * Generate a "natural looking" random rotation
 */
export function calculateRandomRotation(
	currentRotation: number,
	minSpins = 5,
	maxSpins = 8
): number {
	const spins = minSpins + Math.random() * (maxSpins - minSpins);
	const randomOffset = Math.random() * 360;
	return currentRotation + spins * 360 + randomOffset;
}
