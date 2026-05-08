<script>
  import WheelSpinner from '$lib/components/WheelSpinner.svelte';
</script>

<main>
  <h1>🎡 Rigged Wheel Spinner</h1>
  <p>Add items, then spin to pick a random winner!</p>
  <WheelSpinner />
</main>

<style>
  main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  h1 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
  }
</style>