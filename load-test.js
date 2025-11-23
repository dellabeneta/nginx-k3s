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
            maxVUs: 1000,
            stages: [
                { target: 500, duration: '30s' },  // Estágio 0
                { target: 2000, duration: '1m' },  // Estágio 1
                { target: 4000, duration: '2m' },  // Estágio 2
                { target: 4000, duration: '3m' },  // Estágio 3
                { target: 0, duration: '1m' },     // Estágio 4
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
    { duration: 30000, name: "🔥 AQUECIMENTO: Subindo para 500 RPS" },
    { duration: 60000, name: "🚀 CARGA: Acelerando para 2000 RPS (HPA deve ativar)" },
    { duration: 120000, name: "💥 ESTRESSE: Forçando até 4000 RPS (Teste de Limite)" },
    { duration: 180000, name: "🧱 SUSTENTAÇÃO: Segurando 4000 RPS (Estabilidade)" },
    { duration: 60000, name: "❄️ RESFRIAMENTO: Descendo para 0 RPS" },
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

    const res = http.get('http://nginx.dellabeneta.io');
    check(res, { 'status was 200': (r) => r.status == 200 });
}
