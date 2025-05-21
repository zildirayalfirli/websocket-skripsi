import { useEffect, useState } from 'react'

const WindMessages = () => {
  const [windData, setWindData] = useState([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || ''
    const socket = new WebSocket(`${baseUrl}/ws/wind`)

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'wind') {
        setWindData(msg.data)
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
    <h2>💨 Wind Messages</h2>
        <ul>
            {windData.slice(0, 10).map((item, idx) => (
            <li key={idx}>
                {new Date(item.Datetime).toLocaleString()} — Kecepatan Angin : {item.Wind_Speed} m/s, Arah Asal Angin : {item.Wind_From}, Arah Tujuan Angin : {item.Wind_To}, Derajat Arah Angin : {item.Degrees_Wind}°
            </li>
            ))}
        </ul>
    </div>
  )
}

export default WindMessages
