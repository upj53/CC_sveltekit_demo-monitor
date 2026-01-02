import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
    
    // ==========================================
    // [WSL 핫 리로딩 고치기]
    // ==========================================
    server: {
        watch: {
            // 파일 시스템 이벤트를 감지 못할 때 강제로 주기적 검사(Polling)를 함
            usePolling: true,
            // 폴링 간격 (너무 짧으면 CPU 먹고, 길면 반응 느림. 100ms 적당)
            interval: 100
        },
        // (선택사항) 호스트 개방: 모바일 기기 등 외부 접속 허용 시 필요
        host: true 
    }
});