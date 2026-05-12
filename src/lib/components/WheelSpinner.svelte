<script lang="ts">
	import Modal from './Modal.svelte';
	import type { RigConfig, SpinResult } from '$lib/types';
	import {
		generateSlicePath,
		getTextPosition,
		getColorForItem,
		selectWinner,
		calculateTargetRotation,
		calculateRandomRotation
	} from '$lib/utils';

	// Props
	let {
		initialItems,
		rigConfig,
		onSpinComplete
	}: {
		initialItems?: string[];
		rigConfig?: RigConfig;
		onSpinComplete?: (result: SpinResult) => void;
	} = $props();

	// State
	let items = $state<string[]>(initialItems ?? []);
	let newItemLabel = $state('');
	let rotation = $state(0);
	let isSpinning = $state(false);
	let showModal = $state(false);
	let lastResult = $state<SpinResult | null>(null);
	let config = $derived<RigConfig>(
		rigConfig ?? {
			enabled: false
		}
	);

	// Config
	const radius = 150;
	const centerX = radius + 20;
	const centerY = radius + 20;
	const spinDuration = 4000;

	// Add item
	function addItem() {
		const trimmed = newItemLabel.trim();
		if (!trimmed) return;

		items = [...items, trimmed];
		newItemLabel = '';
	}

	function removeItem(id: number) {
		if (isSpinning) return;
		items = items.filter((_, index) => index !== id);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			addItem();
		}
	}

	// Spin logic with rigging
	async function spinWheel(event?: MouseEvent) {
		if (isSpinning || items.length < 2) return;

		// Check for secret rig mode: Ctrl+Shift+Click
		const isRigMode = event?.ctrlKey && event?.shiftKey;
		const effectiveRigConfig: RigConfig = isRigMode ? { ...config, enabled: true } : config;

		isSpinning = true;

		// Select winner based on rigging config
		const winner = selectWinner(items, effectiveRigConfig);

		// Calculate target rotation
		const targetRotation = calculateTargetRotation(winner, items, rotation);

		// Animate
		await animateSpin(rotation, targetRotation);

		// Complete
		rotation = targetRotation;
		isSpinning = false;

		lastResult = {
			winner,
			rotation: targetRotation,
			timestamp: Date.now(),
			wasRigged: isRigMode ?? false
		};

		showModal = false;
		showModal = true;
		onSpinComplete?.(lastResult);
	}

	function animateSpin(start: number, end: number): Promise<void> {
		return new Promise((resolve) => {
			const startTime = performance.now();
			const diff = end - start;

			function frame(now: number) {
				const elapsed = now - startTime;
				const progress = Math.min(elapsed / spinDuration, 1);

				// Ease-out cubic for realistic deceleration
				const easeOut = 1 - Math.pow(1 - progress, 3);
				rotation = start + diff * easeOut;

				if (progress < 1) {
					requestAnimationFrame(frame);
				} else {
					resolve();
				}
			}
			requestAnimationFrame(frame);
		});
	}

	// Snippets for modal

	// Generate slices for rendering
	function getSlices() {
		if (items.length === 0) return [];
		return items.map((item, index) => {
			const {
				x,
				y,
				rotation: textRot
			} = getTextPosition(index, items.length, radius, centerX, centerY);
			return {
				path: generateSlicePath(index, items.length, radius, centerX, centerY),
				color: getColorForItem(index),
				text: item,
				textX: x,
				textY: y,
				textRotation: textRot
			};
		});
	}
</script>

{#snippet modalHeader()}
	<h2>🎉 We Have a Winner!</h2>
	<button class="modal-close-btn" onclick={() => (showModal = false)} aria-label="Close">✕</button>
{/snippet}

{#snippet modalFooter()}
	<button class="modal-close-btn" onclick={() => (showModal = false)}>Spin Again!</button>
{/snippet}

<div class="wheel-container">
	<!-- Controls Panel -->
	<div class="controls">
		<h3>📝 Items</h3>

		<div class="input-group">
			<textarea
				bind:value={newItemLabel}
				placeholder="Enter item + press Enter..."
				rows="2"
				onkeydown={handleKeydown}
				disabled={isSpinning}
			></textarea>
			<button onclick={addItem} disabled={isSpinning || !newItemLabel.trim()}>Add</button>
		</div>

		<div class="items-list">
			{#if items.length === 0}
				<p class="empty">Add items to start!</p>
			{:else}
				{#each items as item}
					<div class="item-row">
						<span>{item}</span>
						<button
							class="remove-btn"
							onclick={() => removeItem(items.indexOf(item))}
							disabled={isSpinning}>✕</button
						>
					</div>
				{/each}
			{/if}
		</div>

		<button class="spin-btn" onclick={spinWheel} disabled={isSpinning || items.length < 2}>
			{isSpinning ? '🎡 Spinning...' : '🎰 SPIN!'}
		</button>

		{#if config.enabled}
			<p class="rig-indicator">🎯 Rig mode active</p>
		{/if}
	</div>

	<!-- Wheel -->
	<div class="wheel-wrapper">
		<div class="pointer">▼</div>
		<svg
			width={centerX * 2}
			height={centerY * 2}
			class="wheel-svg"
			style="transform: rotate({rotation}deg);"
		>
			{#each getSlices() as slice}
				<path d={slice.path} fill={slice.color} stroke="#fff" stroke-width="2" />
				<text
					x={slice.textX}
					y={slice.textY}
					transform="rotate({slice.textRotation} {slice.textX} {slice.textY})"
					text-anchor="middle"
					dominant-baseline="middle"
					font-size="11"
					font-weight="bold"
					fill="#fff"
					style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);"
				>
					{slice.text}
				</text>
			{/each}
			<circle cx={centerX} cy={centerY} r="25" fill="#333" stroke="#fff" stroke-width="3" />
		</svg>
	</div>
	Rotations: {(rotation % 360).toFixed(2)}°
</div>

<!-- Winner Modal -->
<Modal open={showModal} header={modalHeader} footer={modalFooter}>
	{#snippet children()}
		<p class="winner-message">The wheel has spoken:</p>
		<span class="winner-name">{lastResult?.winner}</span>
		{#if lastResult?.wasRigged}
			<p class="rigged-badge">🎯 Rigged result</p>
		{/if}
	{/snippet}
</Modal>

<style>
	.wheel-container {
		display: flex;
		gap: 2rem;
		padding: 1rem;
		max-width: 900px;
		margin: 0 auto;
		font-family: system-ui, sans-serif;
	}
	.controls {
		flex: 1;
		min-width: 250px;
	}
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	textarea {
		padding: 0.5rem;
		border: 2px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		resize: vertical;
	}
	textarea:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}
	button {
		padding: 0.5rem 1rem;
		background: #4ecdc4;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover:not(:disabled) {
		background: #45b7d1;
	}
	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
	.items-list {
		max-height: 200px;
		overflow-y: auto;
		margin: 1rem 0;
		border: 1px solid #eee;
		border-radius: 6px;
		padding: 0.5rem;
	}
	.item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}
	.item-row:hover {
		background: #f9f9f9;
	}
	.remove-btn {
		background: #ff6b6b;
		padding: 0.2rem 0.5rem;
		font-size: 0.9rem;
	}
	.remove-btn:hover:not(:disabled) {
		background: #ee5a5a;
	}
	.spin-btn {
		width: 100%;
		padding: 1rem;
		font-size: 1.2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	.spin-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, #5568d3 0%, #663d91 100%);
		transform: translateY(-1px);
	}
	.rig-indicator {
		text-align: center;
		color: #666;
		font-size: 0.9rem;
		margin-top: 0.5rem;
		font-style: italic;
	}
	.wheel-wrapper {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}
	.pointer {
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 2rem;
		color: #333;
		z-index: 10;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	.wheel-svg {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
	}
	.empty {
		color: #999;
		font-style: italic;
		text-align: center;
		padding: 1rem;
	}
	.winner-name {
		display: block;
		font-size: 2rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0.5rem 0;
		animation: pulse 1.5s ease-in-out infinite;
	}
	.rigged-badge {
		background: #fff3cd;
		color: #856404;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.9rem;
		display: inline-block;
		margin-top: 0.5rem;
	}
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}
	@media (max-width: 700px) {
		.wheel-container {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
