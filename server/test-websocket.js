import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 5000,
  duration: __ENV.DURATION ? __ENV.DURATION : '30m',
};

const VUS_PER_BATCH = 100;
const BATCH_INTERVAL_MS = 100;

const wsConnectionDuration = new Trend('ws_connection_duration', true);
const wsMessageLatency = new Trend('ws_message_latency', true);
const wsFirstResponseTime = new Trend('ws_first_response_time', true);
const wsErrorRate = new Rate('ws_error_rate');
const wsTotalMessages = new Counter('ws_total_messages');

const MAX_CONNECT_RETRIES = 5;
const CONNECT_TIMEOUT_MS = 10000;
const INACTIVITY_TIMEOUT_MS = 60000;

export default function () {
  const batchNumber = Math.floor((__VU - 1) / VUS_PER_BATCH);
  const delayForThisVU = batchNumber * (BATCH_INTERVAL_MS / 1000);

  if (delayForThisVU > 0) {
    sleep(delayForThisVU);
  }

  const url = 'ws://145.79.12.40:9100';

  let connectedSuccessfully = false;
  let connectRetries = 0;
  let firstMessageReceived = false;
  let connectionStartTime = Date.now();

  while (!connectedSuccessfully && connectRetries < MAX_CONNECT_RETRIES) {
    const res = ws.connect(url, {
      timeout: CONNECT_TIMEOUT_MS / 1000,
    }, function (socket) {
      socket.on('open', () => {
        connectedSuccessfully = true;
        wsErrorRate.add(0);
        connectionStartTime = Date.now();
      });

      socket.on('message', (msg) => {
        wsTotalMessages.add(1);
        try {
          const data = JSON.parse(msg);
          const receivedTime = Date.now();

          const sentTime = typeof data.sent_at === 'number' ? data.sent_at : 0;
          if (sentTime > 0) {
            wsMessageLatency.add(receivedTime - sentTime);
          }

          if (!firstMessageReceived) {
            wsFirstResponseTime.add(receivedTime - connectionStartTime);
            firstMessageReceived = true;
          }

          socket.setTimeout(() => {
            socket.close();
          }, INACTIVITY_TIMEOUT_MS);

        } catch (e) {
          console.error(`⚠️ JSON error (VU ${__VU}): ${e.message}`);
          wsErrorRate.add(1);
        }
      });

      socket.on('close', () => {
      });

      socket.on('error', (e) => {
        console.error(`❌ Socket error (VU ${__VU}): ${e.error()}`);
        wsErrorRate.add(1);
      });
    });

    const ok = check(res, {
      '✅ status is 101': (r) => r && r.status === 101,
    });

    if (!ok) {
      wsErrorRate.add(1);
      console.log(`❌ Connection failed: VU ${__VU} (attempt ${connectRetries + 1}, status: ${res ? res.status : 'N/A'})`);
      sleep(1);
    }

    connectRetries++;
  }

  if (!connectedSuccessfully) {
    console.error(`🔴 Failed to connect after ${MAX_CONNECT_RETRIES} retries: VU ${__VU}`);
    wsErrorRate.add(1);
  }
}