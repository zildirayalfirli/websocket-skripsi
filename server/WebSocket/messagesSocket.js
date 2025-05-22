import Humidity from '../models/humidity.js'
import Temperature from '../models/temperature.js'
import SurfacePressure from '../models/surfacePressure.js'
import TideHeight from '../models/tideHeight.js'
import Warning from '../models/warning.js'
import WaveHeight from '../models/waveHeight.js'
import Weather from '../models/weather.js'
import Wind from '../models/wind.js'

const clients = new Map()
let activeClients = 0

export const messagesWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    activeClients++
    clients.set(ws, null)
    // console.log(`✅ [PID ${process.pid}] Client connected | Total: ${clients.size}`)

    const timeout = setTimeout(() => {
      if (ws.readyState === ws.OPEN) {
        ws.close()
        // console.log(`⏱️ [PID ${process.pid}] Closed idle client after 15s of no data sent`)
      }
    }, 15000)
    clients.set(ws, timeout)

    ws.on('close', () => {
      activeClients--
      clearTimeout(clients.get(ws))
      clients.delete(ws)
      console.log(`🔴 [PID ${process.pid}] Client disconnected | Total: ${clients.size}`)
    })
  })

  setInterval(async () => {
    try {
      const [humidity, temperature, surfacePressure, tideHeight, warning, waveHeight, weather, wind] = await Promise.all([
        Humidity.find().sort({ Timestamp: -1 }).limit(10),
        Temperature.find().sort({ Timestamp: -1 }).limit(10),
        SurfacePressure.find().sort({ Timestamp: -1 }).limit(10),
        TideHeight.find().sort({ Timestamp: -1 }).limit(10),
        Warning.find().sort({ Timestamp: -1 }).limit(10),
        WaveHeight.find().sort({ Timestamp: -1 }).limit(10),
        Weather.find().sort({ Timestamp: -1 }).limit(10),
        Wind.find().sort({ Timestamp: -1 }).limit(10)
      ])

      const sentAt = Date.now()
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
      })

      for (const [client, timeout] of clients.entries()) {
        if (client.readyState === client.OPEN) {
          client.send(payload)

          clearTimeout(timeout)
          const newTimeout = setTimeout(() => {
            if (client.readyState === client.OPEN) {
              client.close()
              console.log(`⏱️ [PID ${process.pid}] Closed client after 15s of no data sent`)
            }
          }, 15000)
          clients.set(client, newTimeout)
        }
      }

      console.log(`📤 [PID ${process.pid}] Broadcasted to ${clients.size} clients at ${new Date(sentAt).toISOString()}`)
    } catch (err) {
      const errorPayload = JSON.stringify({ type: 'error', error: err.message })
      for (const [client] of clients.entries()) {
        if (client.readyState === client.OPEN) {
          client.send(errorPayload)
        }
      }
    }
  }, 5000)
}

