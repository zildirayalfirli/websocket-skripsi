import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import { WebSocketServer } from 'ws'
import { parse } from 'url'

import { connectDB } from './db/mongodb.js'
import { humidityWebSocketHandler } from './WebSocket/humiditySocket.js'
import { surfacePressureWebSocketHandler } from './WebSocket/surfacepressureSocket.js'
import { temperatureWebSocketHandler } from './WebSocket/temperatureSocket.js'
import { tideHeightWebSocketHandler } from './WebSocket/tideheightSocket.js'
import { warningWebSocketHandler } from './WebSocket/warningSocket.js'
import { waveHeightWebSocketHandler } from './WebSocket/waveheightSocket.js'
import { weatherWebSocketHandler } from './WebSocket/weatherSocket.js'
import { windWebSocketHandler } from './WebSocket/windSocket.js'
import { messagesWebSocketHandler } from './WebSocket/messagesSocket.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

connectDB()

const server = http.createServer(app)

const wssHumidity = new WebSocketServer({ noServer: true })
const wssSurfacePressure = new WebSocketServer({ noServer: true })
const wssTemperature = new WebSocketServer({ noServer: true })
const wssTideHeight = new WebSocketServer({ noServer: true })
const wssWarning = new WebSocketServer({ noServer: true })
const wssWaveHeight = new WebSocketServer({ noServer: true })
const wssWeather = new WebSocketServer({ noServer: true })
const wssWind = new WebSocketServer({ noServer: true })
const wssMessages = new WebSocketServer({ noServer: true })


server.on('upgrade', (req, socket, head) => {
  const { pathname } = parse(req.url)

  if (pathname === '/') {
  wssMessages.handleUpgrade(req, socket, head, (ws) => {
    wssMessages.emit('connection', ws, req)
  })
  // } else if (pathname === '/ws/humidity') {
  //   wssHumidity.handleUpgrade(req, socket, head, (ws) => {
  //     wssHumidity.emit('connection', ws, req)
  //   })
  // } else if (pathname === '/ws/surfacepressure') {
  //   wssSurfacePressure.handleUpgrade(req, socket, head, (ws) => {
  //     wssSurfacePressure.emit('connection', ws, req)
  //   })
  // } else if (pathname === '/ws/temperature') {
  //   wssTemperature.handleUpgrade(req, socket, head, (ws) => {
  //     wssTemperature.emit('connection', ws, req)
  //   })
  // } else if (pathname === '/ws/tideheight') {
  //   wssTideHeight.handleUpgrade(req, socket, head, (ws) => {
  //     wssTideHeight.emit('connection', ws, req)
  //   })
  // } else if (pathname === '/ws/warning') {
  //   wssWarning.handleUpgrade(req, socket, head, (ws) => {
  //     wssWarning.emit('connection', ws, req)
  //   })
  // } else if (pathname === '/ws/waveheight') {
  //   wssWaveHeight.handleUpgrade(req, socket, head, (ws) => {
  //     wssWaveHeight.emit('connection', ws, req)
  //   })
  // } else if (pathname === '/ws/weather') {
  //   wssWeather.handleUpgrade(req, socket, head, (ws) => {
  //     wssWeather.emit('connection', ws, req)
  //   })
  // } else if (pathname === '/ws/wind') {
  //   wssWind.handleUpgrade(req, socket, head, (ws) => {
  //     wssWind.emit('connection', ws, req)
  //   })
  // } 
  } else {
    socket.destroy()
  }
})

// humidityWebSocketHandler(wssHumidity)
// surfacePressureWebSocketHandler(wssSurfacePressure)
// temperatureWebSocketHandler(wssTemperature)
// tideHeightWebSocketHandler(wssTideHeight)
// warningWebSocketHandler(wssWarning)
// waveHeightWebSocketHandler(wssWaveHeight)
// weatherWebSocketHandler(wssWeather)
// windWebSocketHandler(wssWind)
messagesWebSocketHandler(wssMessages)

const PORT = process.env.PORT || 9100
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
  console.log(`🌐 WebSocket endpoints ready`)
})
