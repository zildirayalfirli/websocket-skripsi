import { useEffect, useState } from 'react'

const WeatherMessages = () => {
  const [weatherData, setWeatherData] = useState([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || ''
    const socket = new WebSocket(`${baseUrl}/ws/weather`)

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'weather') {
        setWeatherData(msg.data)
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
    <h2>🌦 Weather Messages</h2>
        <ul>
            {weatherData.slice(0, 10).map((item, idx) => (
            <li key={idx}>
                {new Date(item.Datetime).toLocaleString()} — Cuaca : {item.Weathers_Category}, Kelembapan Udara : {item.Air_Humidity} %, Suhu : {item.Temperature} °C
            </li>
            ))}
        </ul>
    </div>
  )
}

export default WeatherMessages
