import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import { WebSocketServer } from 'ws'
import { parse } from 'url'

import { connectDB } from './db/mongodb.js'
import { messagesWebSocketHandler } from './WebSocket/messagesSocket.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

connectDB()

const server = http.createServer(app)

const wssMessages = new WebSocketServer({ noServer: true })


server.on('upgrade', (req, socket, head) => {
  const { pathname } = parse(req.url)

  if (pathname === '/') {
  wssMessages.handleUpgrade(req, socket, head, (ws) => {
    wssMessages.emit('connection', ws, req)
  })
  } else {
    socket.destroy()
  }
})

messagesWebSocketHandler(wssMessages)

const PORT = process.env.PORT || 9000
server.listen(PORT, () => {
  console.log(`🚀 Server is running`)
})
