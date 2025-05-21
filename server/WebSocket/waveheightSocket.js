import WaveHeight from '../models/waveHeight.js'

const clients = new Set()

export const waveHeightWebSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`🟢 WaveHeight client connected (${clients.size})`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`🔴 WaveHeight client disconnected (${clients.size})`)
    })
  })

  setInterval(async () => {
    try {
      const data = await WaveHeight.find()
      const payload = JSON.stringify({ type: 'waveHeight', data })

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
