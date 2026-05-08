<script>
  // Reactive state using Svelte 5 runes
  let items = $state(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
  let newItem = $state('');
  let rotation = $state(0);
  let isSpinning = $state(false);
  let spinTimeout;

  // Wheel configuration
  const radius = 150;
  const centerX = radius + 20;
  const centerY = radius + 20;
  const sliceColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

  // Add a new item to the wheel
  /**
   * @returns {void}
   */
  function addItem() {
    const trimmed = newItem.trim();
    if (trimmed && !items.includes(trimmed)) {
      items = [...items, trimmed];
      newItem = '';
    }
  }

  // Remove an item from the wheel
  /**
   * @param {number} index
   */
  function removeItem(index) {
    items = items.filter((_, i) => i !== index);
  }

  // Handle keypress in textarea
  /**
   * @param {{ key: string; shiftKey: any; preventDefault: () => void; }} e
   */
  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addItem();
    }
  }

  // Spin the wheel!
  function spinWheel() {
    if (isSpinning || items.length < 2) return;
    
    isSpinning = true;
    
    // Random rotation: 5-10 full spins + random offset
    const extraSpins = 5 + Math.random() * 5;
    const randomOffset = Math.random() * 360;
    const targetRotation = rotation + (extraSpins * 360) + randomOffset;
    
    // Animate the spin
    const duration = 4000; // 4 seconds
    const startTime = performance.now();
    const startRotation = rotation;
    const rotationDiff = targetRotation - startRotation;

    /**
     * @param {number} currentTime
     */
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      rotation = startRotation + (rotationDiff * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        // Calculate winner (pointer is at top = 270° in SVG)
        const normalizedRotation = ((rotation % 360) + 360) % 360;
        const sliceAngle = 360 / items.length;
        // Pointer at 270° (top), so we calculate which slice aligns there
        const winnerIndex = Math.floor(((270 - normalizedRotation) % 360 + 360) % 360 / sliceAngle) % items.length;
        console.log('🎉 Winner:', items[winnerIndex]);
        // You could emit an event or show a modal here
      }
    }
    
    requestAnimationFrame(animate);
  }

  // Generate wheel slices
  function getSlices() {
    if (items.length === 0) return [];
    const sliceAngle = (2 * Math.PI) / items.length;
    
    return items.map((item, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2; // Start from top
      const endAngle = (index + 1) * sliceAngle - Math.PI / 2;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      
      const midAngle = (startAngle + endAngle) / 2;
      const textX = centerX + (radius * 0.6) * Math.cos(midAngle);
      const textY = centerY + (radius * 0.6) * Math.sin(midAngle);
      const textRotation = (midAngle * 180 / Math.PI) + 90;
      
      return {
        path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: sliceColors[index % sliceColors.length],
        text: item,
        textX,
        textY,
        textRotation
      };
    });
  }
</script>

<div class="wheel-container">
  <!-- Item Management Panel -->
  <div class="controls">
    <h3>📝 Add Items</h3>
    <div class="input-group">
      <textarea
        bind:value={newItem}
        placeholder="Enter item and press Enter..."
        rows="3"
        onkeydown={handleKeydown}
        disabled={isSpinning}
      ></textarea>
      <button onclick={addItem} disabled={isSpinning || !newItem.trim()}>
        Add
      </button>
    </div>
    
    <div class="items-list">
      {#if items.length === 0}
        <p class="empty">No items yet. Add some!</p>
      {:else}
        {#each items as item, index}
          <div class="item-row">
            <span>{index + 1}. {item}</span>
            <button 
              class="remove-btn" 
              onclick={() => removeItem(index)}
              disabled={isSpinning}
            >✕</button>
          </div>
        {/each}
      {/if}
    </div>
    
    <button 
      class="spin-btn" 
      onclick={spinWheel} 
      disabled={isSpinning || items.length < 2}
    >
      {isSpinning ? '🎡 Spinning...' : '🎰 SPIN!'}
    </button>
  </div>

  <!-- Wheel Visualization -->
  <div class="wheel-wrapper">
    <!-- Pointer indicator -->
    <div class="pointer">▼</div>
    
    <svg 
      width={centerX * 2} 
      height={centerY * 2}
      class="wheel-svg"
      style="transform: rotate({rotation}deg);"
    >
      {#each getSlices() as slice}
        <path
          d={slice.path}
          fill={slice.color}
          stroke="#fff"
          stroke-width="2"
        />
        <text
          x={slice.textX}
          y={slice.textY}
          transform="rotate({slice.textRotation} {slice.textX} {slice.textY})"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="12"
          font-weight="bold"
          fill="#fff"
          style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);"
        >
          {slice.text}
        </text>
      {/each}
      
      <!-- Center circle -->
      <circle 
        cx={centerX} 
        cy={centerY} 
        r="25" 
        fill="#333" 
        stroke="#fff" 
        stroke-width="3"
      />
    </svg>
  </div>
</div>

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
    background: #4ECDC4;
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
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .wheel-svg {
    transition: transform 0s; /* We animate via JS for precise control */
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  }
  
  .empty {
    color: #999;
    font-style: italic;
    text-align: center;
    padding: 1rem;
  }
  
  @media (max-width: 700px) {
    .wheel-container {
      flex-direction: column;
      align-items: center;
    }
  }
</style>