<script lang="ts">
    let { data } = $props();

    function getColor(score: number) {
        if (!score) return "#555";
        if (score <= 25) return "#FF4136"; 
        if (score <= 45) return "#FF851B"; 
        if (score <= 55) return "#AAAAAA"; 
        if (score <= 75) return "#2ECC40"; 
        return "#01FF70"; 
    }
</script>

<main class="container">
    <div class="card main-card">
        <h1>📉 UPJ Market Mood</h1>
        
        {#if data.fearGreed && data.fearGreed.value > 0}
            <p class="date">
                기준일: {data.fearGreed.date} 
                {#if data.fearGreed.source && data.fearGreed.source.includes("VIX")}
                    <span class="badge">VIX 기반 추정</span>
                {/if}
            </p>
            
            <div class="gauge-box">
                <div class="score" style="color: {getColor(data.fearGreed.value)}">
                    {data.fearGreed.value}
                </div>
                <div class="status">{data.fearGreed.status}</div>
            </div>
        {:else}
            <div class="score" style="font-size: 2rem; margin: 2rem 0;">데이터 로딩 중...</div>
            <p style="color: #666">잠시 후 다시 시도해주세요.</p>
        {/if}
    </div>

    <div class="market-grid">
        {#if data.market}
            {#each data.market as item}
                <div class="card market-card">
                    <h3>{item.name}</h3>
                    <div class="price">{item.price}</div>
                    <div class="change" class:up={item.change >= 0} class:down={item.change < 0}>
                        {item.percent}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</main>

<style>
    :global(body) {
        margin: 0;
        font-family: -apple-system, sans-serif;
        background-color: #111;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        flex-direction: column; 
    }
    .container { width: 100%; max-width: 480px; padding: 20px; box-sizing: border-box; }
    .card { background: #222; border-radius: 16px; border: 1px solid #333; text-align: center; padding: 2rem; margin-bottom: 1rem; }
    
    .main-card h1 { margin: 0; font-size: 1.5rem; color: #eee; }
    .main-card .date { color: #888; font-size: 0.8rem; margin: 1rem 0; display: flex; justify-content: center; align-items: center; gap: 8px;}
    .main-card .score { font-size: 5rem; font-weight: 800; line-height: 1; text-shadow: 0 0 20px rgba(255,255,255,0.1); }
    .main-card .status { font-size: 1.1rem; margin-top: 0.5rem; color: #ccc; }
    
    .badge { background: #333; color: #aaa; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; border: 1px solid #444; }

    .market-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .market-card { padding: 1.5rem 1rem; margin: 0; }
    .market-card h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #aaa; }
    .market-card .price { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.2rem; }
    .market-card .change { font-size: 1rem; font-weight: 600; }
    .up { color: #2ECC40; } .down { color: #FF4136; }
</style>