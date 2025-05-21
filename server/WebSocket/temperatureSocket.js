import Temperature from '../models/temperature.js'

const clients = new Set()

export const temperatureWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 Temperature client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 Temperature client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const data = await Temperature.find()
      const payload = JSON.stringify({ type: 'temperature', data })

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
