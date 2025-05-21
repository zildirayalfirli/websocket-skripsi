import Wind from '../models/wind.js'

const clients = new Set()

export const windWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 Wind client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 Wind client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const data = await Wind.find()
      const payload = JSON.stringify({ type: 'wind', data })

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
