<script lang="ts">
	import { WheelSpinner, type SpinResult } from '$lib';

	const demoItems: string[] = [];

	const rigConfig = {
		enabled: false,
		targetId: 2
	};

	function handleSpinComplete(result: SpinResult) {
		console.log('🎉 Winner:', result.winner);
		console.log('🎯 Was rigged:', result.wasRigged);
		// Could save to history, trigger analytics, etc.
	}
</script>

<main>
	<h1>🎡 Rigged Wheel Spinner</h1>
	<p class="subtitle">
		Add items, then spin!
		<br />
		<small>💡 Pro tip: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+Click "SPIN" for secret rig mode</small>
	</p>

	<WheelSpinner initialItems={demoItems} {rigConfig} onSpinComplete={handleSpinComplete} />
</main>

<style>
	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1rem;
		text-align: center;
	}
	h1 {
		margin-bottom: 0.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.subtitle {
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.6;
	}
	kbd {
		background: #f0f0f0;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: monospace;
		border: 1px solid #ccc;
	}
</style>
