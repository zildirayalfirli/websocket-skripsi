import ws from 'k6/ws';
import { Trend } from 'k6/metrics';

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 500,
  duration: '60s',
};

const latency = new Trend('ws_latency');
const responseTime = new Trend('ws_response_time');

export default function () {
  const url = 'ws://localhost:3002';
  ws.connect(url, {}, function (socket) {
    const start = Date.now();

    socket.on('message', function (msg) {
      const data = JSON.parse(msg);
      const sent = new Date(data.sent_at).getTime();
      const received = Date.now();
      latency.add(received - sent);
      responseTime.add(received - start);
      socket.close();
    });

    socket.setTimeout(() => socket.close(), 5000);
  });
}
