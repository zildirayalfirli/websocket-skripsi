import { useEffect, useState } from 'react'

const HumidityMessages = () => {
  const [humidityData, setHumidityData] = useState([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || ''
    const socket = new WebSocket(`${baseUrl}/ws/humidity`)

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'humidity') {
        setHumidityData(msg.data)
      } else if (msg.type === 'error') {
        console.error('❌ WebSocket error:', msg.error)
      }
    }

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected')
    }

    return () => socket.close()
  }, [])

  return (
    <div>
    <h2>💧 Humidity Messages</h2>
        <ul>
            {humidityData.slice(0, 10).map((item, idx) => (
            <li key={idx}>
              {new Date(item.Datetime).toLocaleString()} — {item.Air_Humidity} %
            </li>
            ))}
        </ul>
    </div>
  )
}

export default HumidityMessages
