import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

// Test life Cycle
// init -> setup -> VU code -> teardown

// 1. init
const ACCOUNT = "HELLO_K6"
const API_LIST = [
    {
        name: "naver",
        metric: new Trend("naver"),
        url: "https://www.naver.com",
        parameter: {}
    },
    {
        name: "google",
        metric: new Trend("google"),
        url: "https://www.google.com",
        parameter: {}
    }
]

// 2. setup
export function setup() {
    // 여러 변수 세팅 가능
}

// options reference: https://k6.io/docs/using-k6/k6-options/reference/
export const options = {
    scenarios: {
        test: {
            executor: 'constant-vus',
            vus: 10,
            duration: '10s',
            gracefulStop: '0s',
            exec: 'default'
        }
    },
    insecureSkipTLSVerify: true,
    thresholds: {
        "naver": ['p(90)<500', 'p(95)<750', 'p(99)<1000'],
        "google": ['p(90)<500', 'p(95)<750', 'p(99)<1000']
    },
    summaryTrendStats: ["p(90)", "p(95)", "p(99)"]
}

// 3. VU code
export default function (data) {
    API_LIST.map(api => {
        const url = api.url;
        const response = http.get(url, {});
        check(response, {
           [api.name]: (res) => res.status === 200
        });
        api.metric.add(response.timings.duration);
    })
    sleep(1);
}

// 4. teardown code
// code runs, postprocessing data and closing the test environment.
export function teardown() {

}

// Customize report using data.
export function handleSummary(data) {
    return {
        'report.json' : JSON.stringify(data)
    }
}