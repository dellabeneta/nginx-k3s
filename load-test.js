import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 1500,
            timeUnit: '1s', // 500 requests per second
            duration: '60s',
            preAllocatedVUs: 50, // how many VUs to pre-allocate
            maxVUs: 200, // max VUs to use if the system slows down
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

export default function () {
    const res = http.get('http://nginx.dellabeneta.io');
    check(res, { 'status was 200': (r) => r.status == 200 });
}
