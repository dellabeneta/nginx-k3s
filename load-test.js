import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

export const options = {
    scenarios: {
        stress_test: {
            executor: 'ramping-arrival-rate',
            startRate: 100,
            timeUnit: '1s',
            preAllocatedVUs: 50,
            maxVUs: 750,
            stages: [
                { target: 50, duration: '1m' },    // Aquecimento
                { target: 100, duration: '1m' },   // Subindo
                { target: 200, duration: '1m' },   // Subindo
                { target: 400, duration: '1m' },   // Subindo
                { target: 500, duration: '1m' },   // Ajuste final para 500
                { target: 500, duration: '1m' },   // Sustentação
                { target: 250, duration: '1m' },   // Descendo
                { target: 125, duration: '1m' },   // Descendo
                { target: 50, duration: '1m' },    // Finalizando
            ],
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.05'],
    },
};

// Nomes amigáveis para exibir no console
const stageConfigs = [
    { duration: 60000, name: "🔥 AQUECIMENTO: Mantendo 50 RPS" },
    { duration: 60000, name: "↗️  SUBINDO: 100 RPS" },
    { duration: 60000, name: "↗️  SUBINDO: 200 RPS" },
    { duration: 60000, name: "↗️  SUBINDO: 400 RPS" },
    { duration: 60000, name: "🚀 PICO: Alcançando 500 RPS" },
    { duration: 60000, name: "🧱 SUSTENTAÇÃO: Segurando 500 RPS" },
    { duration: 60000, name: "↘️  DESCENDO: 250 RPS" },
    { duration: 60000, name: "↘️  DESCENDO: 125 RPS" },
    { duration: 60000, name: "❄️ RESFRIAMENTO: Voltando a 50 RPS" },
];

let lastLoggedStage = -1;

export default function () {
    // Apenas o Virtual User #1 imprime as mensagens para não poluir o log
    if (exec.vu.idInTest === 1) {
        const elapsed = new Date() - exec.scenario.startTime;
        let accumulatedTime = 0;
        let currentStage = -1;

        for (let i = 0; i < stageConfigs.length; i++) {
            accumulatedTime += stageConfigs[i].duration;
            if (elapsed < accumulatedTime) {
                currentStage = i;
                break;
            }
        }

        if (currentStage !== -1 && currentStage !== lastLoggedStage) {
            console.log(`\n\n================================================================`);
            console.log(`⏱️  [${new Date().toLocaleTimeString()}] MUDANÇA DE FASE: ${stageConfigs[currentStage].name}`);
            console.log(`================================================================\n`);
            lastLoggedStage = currentStage;
        }
    }

    const res = http.get('https://nginx.dellabeneta.io');
    check(res, { 'status was 200': (r) => r.status == 200 });
}
