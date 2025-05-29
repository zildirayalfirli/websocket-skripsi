import Humidity from '../models/humidity.js';
import Temperature from '../models/temperature.js';
import SurfacePressure from '../models/surfacePressure.js';
import TideHeight from '../models/tideHeight.js';
import Warning from '../models/warning.js';
import WaveHeight from '../models/waveHeight.js';
import Weather from '../models/weather.js';
import Wind from '../models/wind.js';

const clients = new Map();

export const messagesWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.set(ws, true);

    ws.on('message', (msg) => {
      ws.send(JSON.stringify({ echo: msg }));
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Total active clients: ${clients.size}`);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  setInterval(async () => {
    if (clients.size === 0) return;

    try {
      const [humidity, temperature, surfacePressure, tideHeight, warning, waveHeight, weather, wind] = await Promise.all([
        Humidity.find().limit(10),
        Temperature.find().limit(10),
        SurfacePressure.find().limit(10),
        TideHeight.find().limit(10),
        Warning.find().limit(10),
        WaveHeight.find().limit(10),
        Weather.find().limit(10),
        Wind.find().limit(10)
      ]);

      const sentAt = Date.now();
      const payload = JSON.stringify({
        type: 'all',
        sent_at: sentAt,
        humidity,
        temperature,
        surfacePressure,
        tideHeight,
        warning,
        waveHeight,
        weather,
        wind
      });

      const clientList = [...clients.keys()];
      let clientsSentTo = 0;

      await Promise.all(
        clientList.map(async (client) => {
          if (client.readyState === client.OPEN) {
            try {
              await client.send(payload);
              clientsSentTo++;
            } catch (err) {
              console.error(`[WebSocket] Error sending to client: ${err.message}`);
              client.close();
              clients.delete(client);
            }
          } else {
            client.close();
            clients.delete(client);
          }
        })
      );

      console.log(`📤 [PID ${process.pid}] Broadcasted to ${clientsSentTo} clients at ${new Date(sentAt).toISOString()}. Remaining active clients: ${clients.size}`);
    } catch (err) {
      console.error(`[WebSocket Broadcast] CRITICAL ERROR during broadcast: ${err.message}`, err.stack);
      const errorPayload = JSON.stringify({ type: 'error', error: err.message });

      await Promise.all(
        [...clients.keys()].map(async (client) => {
          if (client.readyState === client.OPEN) {
            try {
              await client.send(errorPayload);
            } catch {
              client.close();
              clients.delete(client);
            }
          }
        })
      );
    }
  }, 5000);
};
