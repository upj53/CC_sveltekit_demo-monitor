import type { PageServerLoad } from './$types';

// ==========================================
// [캐시 저장소] 서버 메모리에 데이터를 임시 저장
// ==========================================
let cache = {
    data: null as any,       // 데이터 보관함
    lastFetch: 0,            // 마지막으로 데이터를 가져온 시간 (Timestamp)
    ttl: 5 * 60 * 1000       // 유효 기간: 5분 (ms 단위)
};

export const load: PageServerLoad = async () => {
    const now = Date.now();

    // 1. 캐시 확인: 데이터가 있고, 아직 5분이 안 지났다면?
    if (cache.data && (now - cache.lastFetch < cache.ttl)) {
        console.log(`⚡ [Cache] 저장된 데이터를 사용합니다. (남은 시간: ${Math.round((cache.ttl - (now - cache.lastFetch))/1000)}초)`);
        return cache.data; // 외부 요청 없이 즉시 반환 (속도 0.001초)
    }

    console.log("🔄 [API] 유효기간 만료! 새로운 데이터를 요청합니다...");

    // ------------------------------------------------
    // 2. 외부 데이터 요청 (기존 로직)
    // ------------------------------------------------
    const getFearGreed = async () => {
        let data = { value: 0, date: "-", status: "Loading...", source: "CNN" };
        try {
            // [CNN 시도]
            const cnnRes = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            if (cnnRes.ok) {
                const json = await cnnRes.json();
                const history = json.fear_and_greed_historical.data;
                const latest = history[history.length - 1];
                data.value = Math.round(latest.y);
                data.date = new Date(latest.x).toISOString().split('T')[0];
                data.source = "Official";
            } else { throw new Error("Blocked"); }
        } catch (e) {
            console.warn("⚠️ CNN 실패 -> VIX 모드");
            // [VIX Fallback]
            try {
                const yahooRes = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/^VIX?interval=1d&range=1d");
                if (yahooRes.ok) {
                    const yJson = await yahooRes.json();
                    const vix = yJson.chart.result[0].meta.regularMarketPrice;
                    let score = 100 - ((vix - 10) * 3.33);
                    data.value = Math.round(Math.max(0, Math.min(100, score)));
                    data.date = new Date().toISOString().split('T')[0];
                    data.source = `VIX(${vix.toFixed(1)}) Est.`;
                } else {
                    data.value = 50; data.status = "Data Unavailable";
                }
            } catch (err) { data.value = 0; }
        }
        
        if (data.value > 0) {
             if (data.value <= 25) data.status = "Extreme Fear (극도의 공포)";
             else if (data.value <= 45) data.status = "Fear (공포)";
             else if (data.value <= 55) data.status = "Neutral (중립)";
             else if (data.value <= 75) data.status = "Greed (탐욕)";
             else data.status = "Extreme Greed (극도의 탐욕)";
             if (data.source.includes("VIX")) data.status += " *";
        }
        return data;
    };

    const getMarketPrice = async (symbol: string, label: string) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        let mData = { name: label, price: "Loading", change: 0, percent: "0.00%" };
        try {
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                const meta = json.chart.result[0].meta;
                const curr = meta.regularMarketPrice || 0;
                const prev = meta.chartPreviousClose || meta.previousClose || curr;
                const change = curr - prev;
                const pct = prev !== 0 ? (change / prev) * 100 : 0;
                
                mData.price = curr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                mData.change = change;
                mData.percent = (isNaN(pct) ? "0.00%" : (change > 0 ? "+" : "") + pct.toFixed(2) + "%");
            }
        } catch (e) { mData.price = "Error"; }
        return mData;
    };

    // 병렬 실행
    const [fearGreed, nasdaq, gold] = await Promise.all([
        getFearGreed(),
        getMarketPrice('^NDX', 'Nasdaq 100'),
        getMarketPrice('GC=F', 'Gold Futures') 
    ]);

    const resultData = {
        fearGreed,
        market: [nasdaq, gold]
    };

    // 3. 결과 캐싱: 성공적으로 데이터를 가져왔다면 캐시에 저장
    if (fearGreed.value > 0) { // 유효한 데이터일 때만 저장
        cache.data = resultData;
        cache.lastFetch = now;
        console.log("💾 [Cache] 데이터 저장 완료 (유효기간 5분)");
    }

    return resultData;
};