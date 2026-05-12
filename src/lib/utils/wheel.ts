export const DEFAULT_COLORS = [
	'#FF6B6B',
	'#4ECDC4',
	'#45B7D1',
	'#FFA07A',
	'#F7DC6F',
	'#BB8FCE',
	'#85C1E2',
	'#7FB3D5'
];

export function generateSlicePath(
	index: number,
	total: number,
	radius: number,
	centerX: number,
	centerY: number
): string {
	if (total === 0) return '';

	const sliceAngle = (2 * Math.PI) / total;
	const startAngle = index * sliceAngle - Math.PI / 2; // Start from top
	const endAngle = (index + 1) * sliceAngle - Math.PI / 2;

	const x1 = centerX + radius * Math.cos(startAngle);
	const y1 = centerY + radius * Math.sin(startAngle);
	const x2 = centerX + radius * Math.cos(endAngle);
	const y2 = centerY + radius * Math.sin(endAngle);

	const largeArc = sliceAngle > Math.PI ? 1 : 0;

	return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export function getTextPosition(
	index: number,
	total: number,
	radius: number,
	centerX: number,
	centerY: number,
	textRadiusFactor = 0.6
): { x: number; y: number; rotation: number } {
	const sliceAngle = (2 * Math.PI) / total;
	const midAngle = index * sliceAngle + sliceAngle / 2 - Math.PI / 2;

	const textRadius = radius * textRadiusFactor;
	const x = centerX + textRadius * Math.cos(midAngle);
	const y = centerY + textRadius * Math.sin(midAngle);
	const rotation = (midAngle * 180) / Math.PI + 90;

	return { x, y, rotation };
}

export function getColorForItem(index: number): string {
	return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}
