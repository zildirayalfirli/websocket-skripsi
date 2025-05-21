import TideHeight from '../models/tideHeight.js'

const clients = new Set()

export const tideHeightWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 TideHeight client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 TideHeight client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const data = await TideHeight.find()
      const payload = JSON.stringify({ type: 'tideHeight', data })

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
