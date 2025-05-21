import Humidity from '../models/humidity.js'
import Temperature from '../models/temperature.js'
import SurfacePressure from '../models/surfacePressure.js'
import TideHeight from '../models/tideHeight.js'
import Warning from '../models/warning.js'
import WaveHeight from '../models/waveHeight.js'
import Weather from '../models/weather.js'
import Wind from '../models/wind.js'

const clients = new Set()

export const messagesWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 Client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 Client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const [humidity, temperature, surfacePressure, tideHeight, warning, waveHeight, weather, wind] = await Promise.all([
        Humidity.find(),
        Temperature.find(),
        SurfacePressure.find(),
        TideHeight.find(),
        Warning.find(),
        WaveHeight.find(),
        Weather.find(),
        Wind.find()
      ])

      const payload = JSON.stringify({
        type: 'all',
        sent_at: new Date().toISOString(),
        humidity,
        temperature,
        surfacePressure,
        tideHeight,
        warning,
        waveHeight,
        weather,
        wind
      })

      for (const client of clients) {
        if (client.readyState === client.OPEN) {
          client.send(payload)
        }
      }
    } catch (err) {
      const errorPayload = JSON.stringify({ type: 'error', error: err.message })
      for (const client of clients) {
        if (client.readyState === client.OPEN) {
          client.send(errorPayload)
        }
      }
    }
  }, 5000)
}
