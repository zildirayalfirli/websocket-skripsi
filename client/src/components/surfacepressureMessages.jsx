import { useEffect, useState } from 'react'

const SurfacePressureMessages = () => {
  const [surfacePressureData, setSurfacePressureData] = useState([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || ''
    const socket = new WebSocket(`${baseUrl}/ws/surfacepressure`)

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'surfacePressure') {
        setSurfacePressureData(msg.data)
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
      <h2>📉 Surface Pressure Messages</h2>
        <ul>
            {surfacePressureData.slice(0, 10).map((item, idx) => (
            <li key={idx}>
                {new Date(item.Datetime).toLocaleString()} — {item.Surface_Pressure} hPa
            </li>
            ))}
        </ul>
    </div>
  )
}

export default SurfacePressureMessages
