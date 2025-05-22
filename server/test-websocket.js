import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 500,
  duration: '180s',
};

const responseTimeTrend = new Trend('ws_response_time');
const latencyTrend = new Trend('ws_latency');
const throughputRate = new Rate('ws_throughput');
const throughputCounter = new Counter('ws_successes');

const MAX_RETRIES = 3;
const TIMEOUT_MS = 15000;

export default function () {
  const url = 'ws://localhost:9100';

  let connected = false;
  let retries = 0;

  while (!connected && retries < MAX_RETRIES) {
    const res = ws.connect(url, {}, function (socket) {
      const startTime = Date.now();

      socket.on('open', () => {
        console.log(`🟢 Connected: VU ${__VU} (retry ${retries})`);
      });

      socket.on('message', (msg) => {
        try {
          const data = JSON.parse(msg);
          const receivedTime = Date.now();

          const sentTime = data.sent_at
            ? typeof data.sent_at === 'number'
              ? data.sent_at
              : new Date(data.sent_at).getTime()
            : 0;

          const latency = sentTime && !isNaN(sentTime)
            ? receivedTime - sentTime
            : 0;

          const responseTime = receivedTime - startTime;

          latencyTrend.add(latency);
          responseTimeTrend.add(responseTime);
          throughputRate.add(true);
          throughputCounter.add(1);

          connected = true;
          socket.close();
        } catch (e) {
          console.error(`❌ JSON parse error (VU ${__VU}): ${e.message}`);
        }
      });

      socket.setTimeout(() => {
        console.warn(`⏳ Timeout: VU ${__VU} no message in ${TIMEOUT_MS / 1000}s`);
        throughputRate.add(false);
        socket.close();
      }, TIMEOUT_MS);

      socket.on('close', () => {
        console.log(`🔴 Disconnected: VU ${__VU}`);
      });

      socket.on('error', (e) => {
        console.error(`❌ Socket error (VU ${__VU}): ${e.error()}`);
      });
    });

    const ok = check(res, {
      '✅ status is 101': (r) => r && r.status === 101,
    });

    if (!ok) {
      console.warn(`🔁 Retry ${retries + 1} for VU ${__VU}`);
      throughputRate.add(false);
      sleep(1);
    }

    retries++;
  }
}
