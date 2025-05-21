import { useEffect, useState } from 'react'

const WaveHeightMessages = () => {
  const [waveHeightData, setWaveHeightData] = useState([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || ''
    const socket = new WebSocket(`${baseUrl}/ws/waveheight`)

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'waveHeight') {
        setWaveHeightData(msg.data)
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
    <h2>🌊 Wave Height Messages</h2>
        <ul>
            {waveHeightData.slice(0, 10).map((item, idx) => (
            <li key={idx}>
                {new Date(item.Datetime).toLocaleString()} — Ketinggian Gelombang : {item.Wave_Height}, Kategori Gelombang : {item.Wave_Category}
            </li>
            ))}
        </ul>
    </div>
  )
}

export default WaveHeightMessages
