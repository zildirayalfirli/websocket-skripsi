import ws from 'k6/ws';
import { Trend, Rate, Counter } from 'k6/metrics';

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 100,
  duration: '30s',
};

const responseTimeTrend = new Trend('ws_response_time');
const latencyTrend = new Trend('ws_latency');
const throughputRate = new Rate('ws_throughput');
const throughputCounter = new Counter('ws_successes');

export default function () {
  const url = 'ws://145.79.12.40:9100';

  ws.connect(url, {}, (socket) => {
    const startTime = Date.now();

    socket.on('message', (msg) => {
      const data = JSON.parse(msg);

      const receivedTime = Date.now();
      const sentTime = data.sent_at ? new Date(data.sent_at).getTime() : 0;

      const latency = sentTime ? (receivedTime - sentTime) : 0;

      const responseTime = receivedTime - startTime;

      latencyTrend.add(latency);
      responseTimeTrend.add(responseTime);
      throughputRate.add(true);
      throughputCounter.add(1);

      socket.close();
    });

    socket.setTimeout(() => {
      throughputRate.add(false);
      socket.close();
    }, 5000);
  });
}
