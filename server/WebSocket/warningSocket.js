import Warning from '../models/warning.js'

const clients = new Set()

export const warningWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 Warning client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 Warning client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const data = await Warning.find()
      const payload = JSON.stringify({ type: 'warning', data })

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
