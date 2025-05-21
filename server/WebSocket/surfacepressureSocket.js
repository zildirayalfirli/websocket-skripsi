import SurfacePressure from '../models/surfacePressure.js'

const clients = new Set()

export const surfacePressureWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 SurfacePressure client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 SurfacePressure client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const data = await SurfacePressure.find()
      const payload = JSON.stringify({ type: 'surfacePressure', data })

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
