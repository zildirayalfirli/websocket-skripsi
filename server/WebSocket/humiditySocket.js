import Humidity from '../models/humidity.js'

const clients = new Set()

export const humidityWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 Humidity client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 Humidity client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const data = await Humidity.find()
      const payload = JSON.stringify({ type: 'humidity', data })

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
