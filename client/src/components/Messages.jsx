import { useEffect, useState } from 'react'

const Messages = () => {
  const [humidity, setHumidity] = useState([])
  const [temperature, setTemperature] = useState([])
  const [surfacePressure, setSurfacePressure] = useState([])
  const [tideHeight, setTideHeight] = useState([])
  const [warning, setWarning] = useState([])
  const [waveHeight, setWaveHeight] = useState([])
  const [weather, setWeather] = useState([])
  const [wind, setWind] = useState([])

  useEffect(() => {
    const socket = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}`)

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'all') {
        setHumidity(msg.humidity || [])
        setTemperature(msg.temperature || [])
        setSurfacePressure(msg.surfacePressure || [])
        setTideHeight(msg.tideHeight || [])
        setWarning(msg.warning || [])
        setWaveHeight(msg.waveHeight || [])
        setWeather(msg.weather || [])
        setWind(msg.wind || [])
      } else if (msg.type === 'error') {
        console.error('❌ WebSocket error:', msg.error)
      }
    }

    return () => socket.close()
  }, [])

  return (
    <div>
        <h2>💧 Humidity Messages</h2>
        <ul>
            {humidity.slice(0, 10).map((item, i) => (
                <li key={i}>
                    {new Date(item.Datetime).toLocaleString()} — {item.Air_Humidity} %
                </li>
            ))}
        </ul>

        <h2>🌡️ Temperature Messages</h2>
        <ul>
            {temperature.slice(0, 10).map((item, i) => (
            <li key={i}>
                {new Date(item.Datetime).toLocaleString()} — {item.Temperature} °C
            </li>
            ))}
        </ul>

        <h2>📉 Surface Pressure Messages</h2>
        <ul>
            {surfacePressure.slice(0, 10).map((item, i) => (
            <li key={i}>
                {new Date(item.Datetime).toLocaleString()} — {item.Surface_Pressure} hPa
            </li>
            ))}
        </ul>

        <h2>🌊 Tide Height Messages</h2>
        <ul>
            {tideHeight.slice(0, 10).map((item, i) => (
            <li key={i}>
                {new Date(item.Datetime).toLocaleString()} — {item.Tide_Height} m
            </li>
            ))}
        </ul>

        <h2>⚠️ Warning Messages</h2>
        <ul>
            {warning.slice(0, 10).map((item, i) => (
            <li key={i}>
                {new Date(item.Datetime).toLocaleString()} — {item.Warning_Desc}
            </li>
            ))}
        </ul>

        <h2>🌊 Wave Height Messages</h2>
        <ul>
            {waveHeight.slice(0, 10).map((item, i) => (
            <li key={i}>
                {new Date(item.Datetime).toLocaleString()} — Ketinggian Gelombang : {item.Wave_Height}, Kategori Gelombang : {item.Wave_Category}
            </li>
            ))}
        </ul>

        <h2>🌦 Weather Messages</h2>
        <ul>
            {weather.slice(0, 10).map((item, i) => (
            <li key={i}>
                {new Date(item.Datetime).toLocaleString()} — Cuaca : {item.Weathers_Category}
            </li>
            ))}
        </ul>

        <h2>💨 Wind Messages</h2>
        <ul>
            {wind.slice(0, 10).map((item, i) => (
            <li key={i}>
                {new Date(item.Datetime).toLocaleString()} — Kecepatan Angin : {item.Wind_Speed} m/s, Arah Asal Angin : {item.Wind_From}, Arah Tujuan Angin : {item.Wind_To}, Derajat Arah Angin : {item.Degrees_Wind}°
            </li>
            ))}
        </ul>
    </div>
  )
}

export default Messages
