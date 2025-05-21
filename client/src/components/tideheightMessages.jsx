import { useEffect, useState } from 'react'

const TideHeightMessages = () => {
  const [tideHeightData, setTideHeightData] = useState([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || ''
    const socket = new WebSocket(`${baseUrl}/ws/tideheight`)

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'tideHeight') {
        setTideHeightData(msg.data)
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
      <h2>🌊 Tide Height Messages</h2>
        <ul>
            {tideHeightData.slice(0, 10).map((item, idx) => (
            <li key={idx}>
                {new Date(item.Datetime).toLocaleString()} — {item.Tide_Height} m
            </li>
            ))}
        </ul>
    </div>
  )
}

export default TideHeightMessages
