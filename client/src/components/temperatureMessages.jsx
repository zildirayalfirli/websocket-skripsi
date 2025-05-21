import { useEffect, useState } from 'react'

const TemperatureMessages = () => {
  const [temperatureData, setTemperatureData] = useState([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || ''
    const socket = new WebSocket(`${baseUrl}/ws/temperature`)

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'temperature') {
        setTemperatureData(msg.data)
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
      <h2>🌡️ Temperature Messages</h2>
        <ul>
            {temperatureData.slice(0, 10).map((item, idx) => (
            <li key={idx}>
                {new Date(item.Datetime).toLocaleString()} — {item.Temperature} °C
            </li>
            ))}
        </ul>
    </div>
  )
}

export default TemperatureMessages
