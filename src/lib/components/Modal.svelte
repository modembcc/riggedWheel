<script lang="ts">
	// Props with $bindable for two-way sync
	let { open = $bindable(false), header, children, footer, showConfetti = true } = $props();

	let dialog = $state<HTMLDialogElement>();
	let confettiPieces = $state<Array<{ id: number; left: number; delay: number; color: string }>>(
		[]
	);

	// Sync open state with dialog.showModal()/close()
	$effect(() => {
		if (!dialog) return;

		if (open) {
			dialog.showModal();
			if (showConfetti) generateConfetti();
		} else {
			dialog.close();
		}
	});

	// Handle native dialog close event (Escape key, click outside)
	function handleClose() {
		open = false;
	}

	// Generate confetti particles
	function generateConfetti() {
		const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#F7DC6F', '#BB8FCE', '#85C1E2'];
		confettiPieces = Array.from({ length: 50 }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			delay: Math.random() * 0.5,
			color: colors[Math.floor(Math.random() * colors.length)]
		}));
	}

	// Close when clicking the backdrop (dialog itself)
	function handleDialogClick(e: MouseEvent) {
		if (e.target === dialog) {
			dialog.close();
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog bind:this={dialog} onclose={handleClose} onclick={handleDialogClick} class="modal-dialog">
	{#if showConfetti}
		<div class="confetti-container" aria-hidden="true">
			{#each confettiPieces as piece}
				<div
					class="confetti-piece"
					style="--left: {piece.left}%; --delay: {piece.delay}s; --color: {piece.color}"
				></div>
			{/each}
		</div>
	{/if}

	<div class="modal-content">
		{#if header}
			<div class="modal-header">
				{@render header()}
			</div>
		{/if}

		<div class="modal-body">
			{@render children?.()}
		</div>

		{#if footer}
			<div class="modal-footer">
				{@render footer()}
			</div>
		{:else}
			<!-- Default close button if no footer provided -->
			<div class="modal-footer">
				<button class="modal-close-btn" onclick={() => dialog?.close()}> Close </button>
			</div>
		{/if}
	</div>
</dialog>

<style>
	.modal-dialog {
		max-width: 32em;
		width: 90%;
		border-radius: 1rem;
		border: none;
		padding: 0;
		margin: auto;
		background: transparent;
	}

	.modal-dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		animation: fade-in 0.2s ease-out;
	}

	.modal-content {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		position: relative;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid #f0f0f0;
		margin-bottom: 1rem;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: #333;
	}

	.modal-body {
		text-align: center;
		padding: 0.5rem 0;
	}

	.modal-footer {
		display: flex;
		justify-content: center;
		padding-top: 1rem;
		border-top: 2px solid #f0f0f0;
		margin-top: 1rem;
	}

	.modal-close-btn {
		padding: 0.6rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.modal-close-btn:hover {
		transform: translateY(-2px);
	}

	/* Confetti */
	.confetti-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.confetti-piece {
		position: absolute;
		width: 10px;
		height: 10px;
		background: var(--color);
		top: -20px;
		left: var(--left);
		border-radius: 2px;
		animation: confetti-fall 3s ease-in-out var(--delay) infinite;
		opacity: 0;
		animation-fill-mode: forwards;
	}

	.confetti-piece:nth-child(odd) {
		border-radius: 50%;
		width: 8px;
		height: 8px;
	}

	/* Animations */
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes zoom {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes confetti-fall {
		0% {
			transform: translateY(-20px) rotate(0deg);
			opacity: 1;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(100vh) rotate(720deg);
			opacity: 0;
		}
	}

	/* Mobile */
	@media (max-width: 480px) {
		.modal-content {
			padding: 1.25rem;
		}
		.modal-header h2 {
			font-size: 1.25rem;
		}
	}
</style>
